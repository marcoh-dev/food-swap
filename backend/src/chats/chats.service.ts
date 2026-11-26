import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { EntityManager, Repository } from "typeorm";

import { ChatsGateway } from "./chats.gateway";
import { ChatDetailDto } from "./dtos/chatDetail.dto";
import { ChatListItemDto } from "./dtos/chatListItem.dto";
import { ListingChatStatusDto } from "./dtos/listingChatStatus.dto";
import { MessageResponseDto } from "./dtos/messageResponse.dto";
import { StartChatDto } from "./dtos/startChat.dto";
import { UnreadChatsCountDto } from "./dtos/unreadChatsCount.dto";
import { Chat } from "./entities/chat.entity";
import { Message } from "./entities/message.entity";
import { Listing } from "../listings/entities/listing.entity";
import { PushService } from "../push/push.service";
import { chatPushMessage } from "../push/pushMessage";
import { User } from "../users/entities/user.entity";

type SavedMessage = {
	message: MessageResponseDto;
	participantIds: Array<string | null>;
};

@Injectable()
export class ChatsService {
	private readonly logger = new Logger(ChatsService.name);

	constructor(
		@InjectRepository(Chat)
		private readonly chats: Repository<Chat>,
		private readonly chatsGateway: ChatsGateway,
		private readonly pushService: PushService,
	) {}

	async findAll(currentUser: User): Promise<ChatListItemDto[]> {
		const userId = currentUser.id;
		const chats = await this.chats
			.createQueryBuilder("chat")
			.leftJoin("chat.listing", "listing")
			.addSelect(["listing.id", "listing.title"])
			.leftJoin("chat.owner", "owner")
			.addSelect(["owner.id", "owner.username", "owner.name"])
			.leftJoin("chat.user", "chatUser")
			.addSelect(["chatUser.id", "chatUser.username", "chatUser.name"])
			.leftJoinAndSelect(
				"chat.messages",
				"message",
				'message.id = (SELECT m.id FROM messages m WHERE m."chatId" = chat.id ORDER BY m."createdAt" DESC LIMIT 1)',
			)
			.where(
				"(chat.ownerId = :userId AND chat.deletedByOwner = false) OR (chat.userId = :userId AND chat.deletedByUser = false)",
				{ userId },
			)
			.orderBy("chat.lastMessageAt", "DESC")
			.getMany();

		const items = chats.map((chat) => {
			const isOwner = chat.ownerId === userId;
			const other = isOwner ? chat.user : chat.owner;
			const lastReadAt = isOwner ? chat.ownerLastReadAt : chat.userLastReadAt;
			return {
				id: chat.id,
				listingTitle: chat.listing?.title ?? null,
				otherName: other ? (other.name ?? other.username) : null,
				lastMessage: chat.messages[0]?.content ?? null,
				lastMessageAt: chat.lastMessageAt,
				unread: lastReadAt === null || chat.lastMessageAt > lastReadAt,
			};
		});

		return plainToInstance(ChatListItemDto, items);
	}

	async countUnread(currentUser: User): Promise<UnreadChatsCountDto> {
		const chats = await this.findAll(currentUser);

		return plainToInstance(UnreadChatsCountDto, {
			count: chats.filter((chat) => chat.unread).length,
		});
	}

	async findOne(chatId: string, currentUser: User): Promise<ChatDetailDto> {
		const { id: userId } = currentUser;
		const chat = await this.chats
			.createQueryBuilder("chat")
			.leftJoin("chat.listing", "listing")
			.addSelect(["listing.id", "listing.title"])
			.leftJoin("chat.owner", "owner")
			.addSelect(["owner.id", "owner.username", "owner.name"])
			.leftJoin("chat.user", "chatUser")
			.addSelect(["chatUser.id", "chatUser.username", "chatUser.name"])
			.leftJoinAndSelect("chat.messages", "message")
			.where("chat.id = :chatId", { chatId })
			.andWhere(
				"((chat.ownerId = :userId AND chat.deletedByOwner = false) OR (chat.userId = :userId AND chat.deletedByUser = false))",
				{ userId },
			)
			.orderBy("message.createdAt", "ASC")
			.getOne();

		if (!chat) {
			throw new NotFoundException("Chat nicht gefunden");
		}

		const other = chat.ownerId === userId ? chat.user : chat.owner;
		const conversation = {
			id: chat.id,
			listingId: chat.listingId,
			listingTitle: chat.listing?.title ?? null,
			otherName: other ? (other.name ?? other.username) : null,
			canReply: chat.ownerId !== null && chat.userId !== null,
			messages: chat.messages,
		};

		return plainToInstance(ChatDetailDto, conversation);
	}

	async findForListing(listingId: string, currentUser: User): Promise<ListingChatStatusDto> {
		const chat = await this.chats.findOne({
			where: { listingId, userId: currentUser.id },
			select: { id: true, deletedByUser: true },
		});

		return plainToInstance(ListingChatStatusDto, {
			chatId: chat?.id ?? null,
			hidden: chat?.deletedByUser ?? false,
		});
	}

	async sendToListing(chatPayload: StartChatDto, currentUser: User): Promise<MessageResponseDto> {
		const { listingId, content } = chatPayload;
		const { id: senderId } = currentUser;

		const { message, participantIds } = await this.chats.manager.transaction<SavedMessage>(
			async (manager): Promise<SavedMessage> => {
				const listing = await manager.findOne(Listing, {
					where: { id: listingId },
					relations: { owner: true },
				});

				if (!listing) {
					throw new NotFoundException("Angebot nicht gefunden");
				}

				if (listing.owner.id === senderId) {
					throw new ForbiddenException(
						"Du kannst zu deinem eigenen Angebot keinen Chat starten",
					);
				}

				const result = await manager
					.createQueryBuilder()
					.insert()
					.into(Chat)
					.values({
						listingId,
						ownerId: listing.owner.id,
						userId: senderId,
						deletedByOwner: false,
						deletedByUser: false,
						lastMessageAt: () => "now()",
						userLastReadAt: () => "now()",
					})
					.orUpdate(
						["deletedByOwner", "deletedByUser", "lastMessageAt", "userLastReadAt"],
						["listingId", "ownerId", "userId"],
					)
					.returning("id")
					.execute();

				const [{ id: chatId }] = result.raw as [{ id: string }];

				return {
					message: await this.saveMessage(manager, chatId, senderId, content),
					participantIds: [listing.owner.id, senderId],
				};
			},
		);

		this.chatsGateway.notifyNewMessage(participantIds, message);
		// Not awaited: the push goes out in the background and can't fail sending the message
		void this.sendPush(message, participantIds);

		return message;
	}

	async reply(chatId: string, content: string, currentUser: User): Promise<MessageResponseDto> {
		const { id: senderId } = currentUser;

		const { message, participantIds } = await this.chats.manager.transaction<SavedMessage>(
			async (manager): Promise<SavedMessage> => {
				const chat = await manager.findOne(Chat, {
					where: { id: chatId },
					lock: { mode: "pessimistic_write" },
				});

				if (!chat || (chat.ownerId !== senderId && chat.userId !== senderId)) {
					throw new NotFoundException("Chat nicht gefunden");
				}

				if (chat.ownerId === null || chat.userId === null) {
					throw new ForbiddenException("Die andere Person hat ihr Konto gelöscht");
				}

				await manager.update(Chat, chat.id, {
					deletedByOwner: false,
					deletedByUser: false,
					lastMessageAt: () => "now()",
					[chat.ownerId === senderId ? "ownerLastReadAt" : "userLastReadAt"]: () =>
						"now()",
				});

				return {
					message: await this.saveMessage(manager, chat.id, senderId, content),
					participantIds: [chat.ownerId, chat.userId],
				};
			},
		);

		this.chatsGateway.notifyNewMessage(participantIds, message);
		// Not awaited: the push goes out in the background and can't fail sending the message
		void this.sendPush(message, participantIds);

		return message;
	}

	async markRead(chatId: string, currentUser: User): Promise<void> {
		const { id: userId } = currentUser;
		const chat = await this.chats.findOne({
			where: { id: chatId },
			select: { id: true, ownerId: true, userId: true },
		});

		if (!chat || (chat.ownerId !== userId && chat.userId !== userId)) {
			throw new NotFoundException("Chat nicht gefunden");
		}

		await this.chats.update(chat.id, {
			[chat.ownerId === userId ? "ownerLastReadAt" : "userLastReadAt"]: () => "now()",
		});

		this.chatsGateway.notifyChatRead(userId, chatId);
	}

	async remove(chatId: string, currentUser: User): Promise<void> {
		const { id: userId } = currentUser;

		await this.chats.manager.transaction(async (manager): Promise<void> => {
			const chat = await manager.findOne(Chat, {
				where: { id: chatId },
				lock: { mode: "pessimistic_write" },
			});

			if (!chat || (chat.ownerId !== userId && chat.userId !== userId)) {
				throw new NotFoundException("Chat nicht gefunden");
			}

			if (chat.ownerId === userId) {
				chat.deletedByOwner = true;
			}

			if (chat.userId === userId) {
				chat.deletedByUser = true;
			}

			// A deleted account (NULL) counts as having deleted the chat
			const ownerGone = chat.deletedByOwner || chat.ownerId === null;
			const userGone = chat.deletedByUser || chat.userId === null;

			if (ownerGone && userGone) {
				await manager.delete(Chat, chat.id);
			} else {
				await manager.update(Chat, chat.id, {
					deletedByOwner: chat.deletedByOwner,
					deletedByUser: chat.deletedByUser,
				});
			}
		});

		this.chatsGateway.notifyChatRemoved(userId, chatId);
	}

	/** Sends the message as a push to the other person's devices (never to the sender). Never throws. */
	private async sendPush(message: MessageResponseDto, participantIds: Array<string | null>) {
		const recipientIds = participantIds
			// Without deleted accounts (null); TypeScript infers that only strings remain
			.filter((id) => id !== null)
			.filter((id) => id !== message.senderId);
		if (recipientIds.length === 0) return;

		try {
			const chat = await this.chats.findOne({
				where: { id: message.chatId },
				relations: { listing: true, owner: true, user: true },
			});
			const sender = chat?.owner?.id === message.senderId ? chat.owner : chat?.user;
			if (!chat || !sender) return;

			const push = chatPushMessage({
				chatId: chat.id,
				senderName: sender.name ?? sender.username,
				listingTitle: chat.listing?.title ?? null,
				content: message.content,
			});
			await Promise.all(recipientIds.map((id) => this.pushService.sendToUser(id, push)));
		} catch (error) {
			this.logger.error(
				"Preparing a chat push failed.",
				error instanceof Error ? error.stack : error,
			);
		}
	}

	private async saveMessage(
		manager: EntityManager,
		chatId: string,
		senderId: string,
		content: string,
	): Promise<MessageResponseDto> {
		const message = await manager.save(
			manager.create(Message, {
				chatId,
				senderId,
				content,
			}),
		);

		return plainToInstance(MessageResponseDto, message);
	}
}

import { create } from "zustand";

import {
	deleteChatAction,
	getChatAction,
	getChatsAction,
	replyToChatAction,
	startChatAction,
} from "@/app/actions";
import { socket } from "@/socket";
import type { ChatActions, ChatMessage, ChatState } from "@/lib/types/chat.types";
import type { ActionResult } from "@/lib/types/common.types";

async function call<T>(action: Promise<ActionResult<T>>): Promise<T> {
	const result = await action.catch(() => {
		throw new Error("Could not reach the server. Please check your connection.");
	});
	if (result.error !== undefined) throw new Error(result.error);
	return result.data;
}

export function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
	const byId = new Map(current.map((message) => [message.id, message]));
	for (const message of incoming) byId.set(message.id, message);

	return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

const initialState: ChatState = {
	connected: false,
	userId: null,
	chats: null,
	chatsError: null,
	conversation: null,
	conversationError: null,
};

export const useChatStore = create<ChatState & ChatActions>()((set, get) => {
	let openChatId: string | null = null;

	function receiveMessage(message: ChatMessage) {
		const { conversation, chats } = get();

		if (conversation?.id === message.chatId) {
			set({
				conversation: {
					...conversation,
					messages: mergeMessages(conversation.messages, [message]),
				},
			});
		}

		if (!chats) return;

		const chat = chats.find((item) => item.id === message.chatId);

		if (!chat) {
			void get().loadChats();
			return;
		}

		set({
			chats: [
				{ ...chat, lastMessage: message.content, lastMessageAt: message.createdAt },
				...chats.filter((item) => item.id !== chat.id),
			],
		});
	}

	function removeChat(chatId: string) {
		set((state) => ({
			chats: state.chats?.filter((item) => item.id !== chatId) ?? null,
		}));

		if (get().conversation?.id === chatId) {
			openChatId = null;
			set({ conversation: null, conversationError: "This chat was deleted." });
		}
	}

	socket.on("connect", () => {
		set({ connected: true });

		if (get().chats) void get().loadChats();
		if (openChatId) void get().openChat(openChatId);
	});

	socket.on("disconnect", () => set({ connected: false }));

	socket.on("newMessage", (message: ChatMessage) => {
		receiveMessage(message);
	});

	socket.on("chatRemoved", ({ chatId }: { chatId: string }) => {
		removeChat(chatId);
	});

	return {
		...initialState,

		connect: (token, userId) => {
			set({ userId });
			socket.auth = { token };
			socket.connect();
		},

		disconnect: () => {
			socket.disconnect();
			openChatId = null;
			set(initialState);
		},

		loadChats: async () => {
			try {
				const chats = await call(getChatsAction());
				set({ chats, chatsError: null });
			} catch (error) {
				set({ chatsError: errorMessage(error) });
			}
		},

		openChat: async (chatId) => {
			openChatId = chatId;

			if (get().conversation?.id !== chatId) {
				set({ conversation: null, conversationError: null });
			}

			try {
				const chat = await call(getChatAction(chatId));
				if (openChatId !== chatId) return;

				const current = get().conversation;
				set({
					conversation:
						current?.id === chatId
							? { ...chat, messages: mergeMessages(current.messages, chat.messages) }
							: chat,
					conversationError: null,
				});
			} catch (error) {
				if (openChatId !== chatId || get().conversation?.id === chatId) return;
				set({ conversationError: errorMessage(error) });
			}
		},

		closeChat: () => {
			openChatId = null;
			set({ conversation: null, conversationError: null });
		},

		startChat: async (listingId, content) => {
			const message = await call(startChatAction(listingId, content));
			receiveMessage(message);

			if (get().conversation?.id !== message.chatId) {
				void get().openChat(message.chatId);
			}

			return message;
		},

		sendReply: async (content) => {
			const chatId = get().conversation?.id;
			if (!chatId) return;

			const message = await call(replyToChatAction(chatId, content));
			receiveMessage(message);
		},

		deleteChat: async (chatId) => {
			await call(deleteChatAction(chatId));
			removeChat(chatId);
		},
	};
});

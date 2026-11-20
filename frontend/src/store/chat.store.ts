import type { ChatMessage } from "@food-swap/shared/types";
import { create } from "zustand";

import {
	deleteChatAction,
	getChatAction,
	getChatsAction,
	getUnreadChatsCountAction,
	markChatReadAction,
	replyToChatAction,
	startChatAction,
} from "@/app/chats/actions";
import type { ActionResult } from "@/lib/types/common.types";
import type { ChatActions, ChatState } from "@/store/chat.types";

// The server actions turn backend errors into texts; this adds the one for when they can't run at all
async function call<T>(action: Promise<ActionResult<T>>): Promise<ActionResult<T>> {
	try {
		return await action;
	} catch {
		return { error: "Der Server ist nicht erreichbar. Versuche es später nochmal." };
	}
}

// Messages can arrive twice (own reply via the action and the socket, reload after a reconnect)
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
	unreadCount: 0,
	openChatId: null,
	tabVisible: true,
	conversation: null,
	conversationError: null,
};

/**
 * Chat list, unread count and open chat of the logged-in user. Socket events reach it
 * through `connectChat` (`lib/chatEvents.ts`); components read from it and call its actions.
 */
export const useChatStore = create<ChatState & ChatActions>()((set, get) => {
	function markRead(chatId: string) {
		// On an error the chat stays unread until it's opened again
		void call(markChatReadAction(chatId));
	}

	function receiveMessage(message: ChatMessage) {
		const { openChatId, tabVisible, conversation, chats, userId } = get();
		// The user sees messages in the open chat while the tab is visible, so they count as read right away
		const isSeen = tabVisible && openChatId === message.chatId;
		const fromOther = message.senderId !== userId;

		if (fromOther) {
			if (isSeen) markRead(message.chatId);
			else void get().loadUnreadCount();
		}

		// A chat that is still loading gets the message with its data
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

		// First message of a new chat: the list item comes from the server
		if (!chat) {
			void get().loadChats();
			return;
		}

		set({
			chats: [
				{
					...chat,
					lastMessage: message.content,
					lastMessageAt: message.createdAt,
					unread: fromOther && !isSeen,
				},
				...chats.filter((item) => item.id !== chat.id),
			],
		});
	}

	function removeChat(chatId: string) {
		set((state) => ({
			chats: state.chats?.filter((item) => item.id !== chatId) ?? null,
		}));

		if (get().openChatId === chatId) {
			set({
				openChatId: null,
				conversation: null,
				conversationError: "Dieser Chat wurde gelöscht.",
			});
		}
	}

	return {
		...initialState,

		setUserId: (userId) => set({ userId }),

		reset: () => set(initialState),

		onConnect: () => {
			set({ connected: true });

			// Events sent while offline are lost; the list only if it was loaded before
			void get().loadUnreadCount();
			if (get().chats || get().chatsError) void get().loadChats();
			const { openChatId } = get();
			if (openChatId) void get().openChat(openChatId);
		},

		onDisconnect: () => set({ connected: false }),

		receiveMessage,

		setTabVisible: (visible) => {
			set({ tabVisible: visible });

			const { openChatId, conversation, chats } = get();
			if (!visible || !openChatId || conversation?.id !== openChatId) return;

			// Messages that arrived while the tab was hidden are read once the user sees the chat
			const chat = chats?.find((item) => item.id === openChatId);
			if (!chats || chat?.unread) markRead(openChatId);
		},

		onChatRead: (chatId) => {
			set((state) => ({
				chats:
					state.chats?.map((item) =>
						item.id === chatId ? { ...item, unread: false } : item,
					) ?? null,
			}));
			void get().loadUnreadCount();
		},

		onChatRemoved: (chatId) => {
			removeChat(chatId);
			void get().loadUnreadCount();
		},

		loadChats: async () => {
			const result = await call(getChatsAction());
			set(
				result.error === undefined
					? { chats: result.data, chatsError: null }
					: { chatsError: result.error },
			);
		},

		loadUnreadCount: async () => {
			const result = await call(getUnreadChatsCountAction());
			// On an error the last known count stays; it refreshes on the next chat event
			if (result.error === undefined) set({ unreadCount: result.data });
		},

		openChat: async (chatId) => {
			set({ openChatId: chatId });

			if (get().conversation?.id !== chatId) {
				set({ conversation: null, conversationError: null });
			}

			const result = await call(getChatAction(chatId));
			if (get().openChatId !== chatId) return;

			const current = get().conversation;

			if (result.error !== undefined) {
				// A chat that is already shown stays visible when reloading it fails
				if (current?.id !== chatId) set({ conversationError: result.error });
				return;
			}

			const chat = result.data;
			set({
				conversation:
					current?.id === chatId
						? { ...chat, messages: mergeMessages(current.messages, chat.messages) }
						: chat,
				conversationError: null,
			});
			if (get().tabVisible) markRead(chatId);
		},

		closeChat: () => {
			set({ openChatId: null, conversation: null, conversationError: null });
		},

		startChat: async (listingId, content) => {
			const result = await call(startChatAction(listingId, content));
			if (result.error !== undefined) return result.error;

			receiveMessage(result.data);
			return null;
		},

		sendReply: async (content) => {
			const chatId = get().conversation?.id;
			if (!chatId) return null;

			const result = await call(replyToChatAction(chatId, content));
			if (result.error !== undefined) return result.error;

			receiveMessage(result.data);
			return null;
		},

		deleteChat: async (chatId) => {
			const result = await call(deleteChatAction(chatId));
			if (result.error !== undefined) return result.error;

			removeChat(chatId);
			return null;
		},
	};
});

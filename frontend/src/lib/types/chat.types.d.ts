import type { ChatDetail, ChatListItem, ChatMessage } from "@food-swap/shared/types";

export type ChatState = {
	connected: boolean;
	userId: string | null;
	chats: ChatListItem[] | null;
	chatsError: string | null;
	unreadCount: number;
	conversation: ChatDetail | null;
	conversationError: string | null;
};

export type ChatActions = {
	connect: (token: string, userId: string) => void;
	disconnect: () => void;
	loadChats: () => Promise<void>;
	loadUnreadCount: () => Promise<void>;
	openChat: (chatId: string) => Promise<void>;
	closeChat: () => void;
	startChat: (listingId: string, content: string) => Promise<ChatMessage>;
	sendReply: (content: string) => Promise<void>;
	deleteChat: (chatId: string) => Promise<void>;
};

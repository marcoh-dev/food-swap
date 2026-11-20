import type { ChatDetail, ChatListItem, ChatMessage } from "@food-swap/shared/types";

export type ChatState = {
	connected: boolean;
	userId: string | null;
	chats: ChatListItem[] | null;
	chatsError: string | null;
	unreadCount: number;
	openChatId: string | null;
	conversation: ChatDetail | null;
	conversationError: string | null;
};

export type ChatActions = {
	setUserId: (userId: string) => void;
	reset: () => void;
	onConnect: () => void;
	onDisconnect: () => void;
	receiveMessage: (message: ChatMessage) => void;
	onChatRead: (chatId: string) => void;
	onChatRemoved: (chatId: string) => void;
	loadChats: () => Promise<void>;
	loadUnreadCount: () => Promise<void>;
	openChat: (chatId: string) => Promise<void>;
	closeChat: () => void;
	/** Returns the error text to show, or `null` if it worked. */
	startChat: (listingId: string, content: string) => Promise<string | null>;
	/** Returns the error text to show, or `null` if it worked. */
	sendReply: (content: string) => Promise<string | null>;
	/** Returns the error text to show, or `null` if it worked. */
	deleteChat: (chatId: string) => Promise<string | null>;
};

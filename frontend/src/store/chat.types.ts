import type { ChatDetail, ChatListItem, ChatMessage } from "@food-swap/shared/types";

export type ChatState = {
	/** Whether the socket is connected; not shown anywhere yet. */
	connected: boolean;
	/** The logged-in user, to tell own messages from others. */
	userId: string | null;
	/** The chat list, newest message first; `null` until it's loaded. */
	chats: ChatListItem[] | null;
	chatsError: string | null;
	/** Number of chats with unread messages (badge and tab title). */
	unreadCount: number;
	/** The chat that is open, also while it's still loading. */
	openChatId: string | null;
	/** Whether the browser tab is visible; messages in a hidden tab stay unread. */
	tabVisible: boolean;
	/** The loaded messages of the open chat. */
	conversation: ChatDetail | null;
	conversationError: string | null;
};

export type ChatActions = {
	setUserId: (userId: string) => void;
	/** Clears everything, e.g. on logout. */
	reset: () => void;
	/** Socket (re)connected: reloads what may have changed while it was offline. */
	onConnect: () => void;
	onDisconnect: () => void;
	/** Adds a new or own message to the open chat and the chat list. */
	receiveMessage: (message: ChatMessage) => void;
	/** Marks the open chat as read when the tab becomes visible again. */
	setTabVisible: (visible: boolean) => void;
	/** The user read a chat, possibly in another tab. */
	onChatRead: (chatId: string) => void;
	/** The user deleted a chat, possibly in another tab. */
	onChatRemoved: (chatId: string) => void;
	loadChats: () => Promise<void>;
	loadUnreadCount: () => Promise<void>;
	/** Loads a chat and marks it as read. If another chat is opened meanwhile, the result is ignored. */
	openChat: (chatId: string) => Promise<void>;
	closeChat: () => void;
	/** Sends the first message about a listing. Returns the error text to show, or `null` if it worked. */
	startChat: (listingId: string, content: string) => Promise<string | null>;
	/** Replies in the open chat. Returns the error text to show, or `null` if it worked. */
	sendReply: (content: string) => Promise<string | null>;
	/** Returns the error text to show, or `null` if it worked. */
	deleteChat: (chatId: string) => Promise<string | null>;
};

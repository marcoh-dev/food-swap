export type ChatListItem = {
	id: string;
	listingTitle: string | null;
	otherName: string | null;
	lastMessage: string | null;
	lastMessageAt: string;
	unread: boolean;
};

export type ChatMessage = {
	id: string;
	chatId: string;
	senderId: string | null;
	content: string;
	createdAt: string;
};

export type ChatDetail = {
	id: string;
	listingId: string | null;
	listingTitle: string | null;
	otherName: string | null;
	canReply: boolean;
	messages: ChatMessage[];
};

export type SocketTicketResponse = {
	ticket: string;
};

export type ListingChatStatus = {
	chatId: string | null;
	hidden: boolean;
};

/**
 * The events the backend sends over the chat socket (`backend/src/chats/chats.gateway.ts`), for
 * typing the Socket.IO client as `Socket<ServerToClientEvents>`. The backend can't import this
 * file (shared only exports TypeScript, which the backend's build doesn't compile), so keep the
 * event names in sync with the gateway.
 */
export type ServerToClientEvents = {
	/** A message in one of the user's chats, also the user's own (e.g. from another tab). */
	newMessage: (message: ChatMessage) => void;
	/** The user read a chat, possibly on another device. */
	chatRead: (payload: { chatId: string }) => void;
	/** The user deleted a chat, possibly on another device. */
	chatRemoved: (payload: { chatId: string }) => void;
};

export type ChatListItem = {
	id: string;
	listingTitle: string | null;
	otherUsername: string | null;
	lastMessage: string | null;
	lastMessageAt: string;
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
	otherUsername: string | null;
	canReply: boolean;
	messages: ChatMessage[];
};

export type ChatState = {
	connected: boolean;
	userId: string | null;
	chats: ChatListItem[] | null;
	chatsError: string | null;
	conversation: ChatDetail | null;
	conversationError: string | null;
};

export type ChatActions = {
	connect: (token: string, userId: string) => void;
	disconnect: () => void;
	loadChats: () => Promise<void>;
	openChat: (chatId: string) => Promise<void>;
	closeChat: () => void;
	startChat: (listingId: string, content: string) => Promise<ChatMessage>;
	sendReply: (content: string) => Promise<void>;
	deleteChat: (chatId: string) => Promise<void>;
};

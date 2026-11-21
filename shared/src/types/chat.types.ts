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

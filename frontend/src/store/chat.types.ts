export type ChatState = {
	/** The logged-in user, to tell own messages from others; `null` while logged out. */
	userId: string | null;
	/** The chat that is open, also while it's still loading. */
	openChatId: string | null;
	/** The open chat was deleted (in this or another tab), so it isn't loaded again. */
	removedChatId: string | null;
	/** Whether the browser tab is visible; messages in a hidden tab stay unread. */
	tabVisible: boolean;
	/** Whether the open chat is scrolled to its newest message; above it, new messages stay unread. */
	atNewest: boolean;
};

export type ChatActions = {
	setUserId: (userId: string) => void;
	/**
	 * Also forgets a removed chat, so a chat that comes back can be opened again; a chat opens at
	 * its newest message.
	 */
	setOpenChatId: (chatId: string | null) => void;
	setRemovedChatId: (chatId: string) => void;
	setTabVisible: (visible: boolean) => void;
	setAtNewest: (atNewest: boolean) => void;
	/** Clears everything, e.g. on logout. */
	reset: () => void;
};

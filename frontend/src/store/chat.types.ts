export type ChatState = {
	/** Whether the socket is connected; not shown anywhere yet. */
	connected: boolean;
	/** The logged-in user, to tell own messages from others; `null` while logged out. */
	userId: string | null;
	/** The chat that is open, also while it's still loading. */
	openChatId: string | null;
	/** The open chat was deleted (in this or another tab), so it isn't loaded again. */
	removedChatId: string | null;
	/** Whether the browser tab is visible; messages in a hidden tab stay unread. */
	tabVisible: boolean;
};

export type ChatActions = {
	setConnected: (connected: boolean) => void;
	setUserId: (userId: string) => void;
	/** Also forgets a removed chat, so a chat that comes back can be opened again. */
	setOpenChatId: (chatId: string | null) => void;
	setRemovedChatId: (chatId: string) => void;
	setTabVisible: (visible: boolean) => void;
	/** Clears everything, e.g. on logout. */
	reset: () => void;
};

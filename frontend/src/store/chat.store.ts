import { create } from "zustand";

import type { ChatActions, ChatState } from "@/store/chat.types";

const initialState: ChatState = {
	connected: false,
	userId: null,
	openChatId: null,
	removedChatId: null,
	tabVisible: true,
	atNewest: true,
};

/**
 * What the chat screens and the socket events need to know besides the chat data, which is in
 * the TanStack Query cache (`lib/chatQueries.ts`): who is logged in, which chat is open, whether
 * it's scrolled to the newest message and whether the tab is visible.
 */
export const useChatStore = create<ChatState & ChatActions>()((set) => ({
	...initialState,
	setConnected: (connected) => set({ connected }),
	setUserId: (userId) => set({ userId }),
	setOpenChatId: (openChatId) => set({ openChatId, removedChatId: null, atNewest: true }),
	setRemovedChatId: (removedChatId) => set({ removedChatId }),
	setTabVisible: (tabVisible) => set({ tabVisible }),
	setAtNewest: (atNewest) => set({ atNewest }),
	reset: () => set(initialState),
}));

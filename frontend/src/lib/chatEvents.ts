import type { ChatDetail, ChatListItem, ChatMessage } from "@food-swap/shared/types";
import type { QueryClient } from "@tanstack/react-query";

import { getChatsAction, getSocketTicketAction } from "@/app/chats/actions";
import {
	addMessageToCache,
	CHAT_LIST_QUERY_KEY,
	chatQueryKey,
	CHATS_QUERY_KEY,
	isChatInCache,
	removeChatFromCache,
	setChatUnreadInCache,
	UNREAD_CHATS_COUNT_QUERY_KEY,
} from "@/lib/chatCache";
import { markChatRead } from "@/lib/chatQueries";
import { notificationsEnabled } from "@/lib/notifications";
import { socket } from "@/socket";
import { useChatStore } from "@/store/chat.store";

type ConnectChatOptions = {
	queryClient: QueryClient;
	userId: string;
	onNotificationClick: (chatId: string) => void;
	/** Called when the server ends the connection because the login is no longer valid. */
	onSessionEnded: () => void;
};

// Only for messages from others, and not for the open chat while the tab is visible
async function showNotification(
	queryClient: QueryClient,
	message: ChatMessage,
	onClick: (chatId: string) => void,
) {
	if (!notificationsEnabled()) return;

	const { userId, openChatId, tabVisible } = useChatStore.getState();
	if (message.senderId === userId) return;
	if (tabVisible && openChatId === message.chatId) return;

	const findChat = (list?: ChatListItem[] | null) =>
		list?.find((item) => item.id === message.chatId);
	// The chat list may not be loaded yet (e.g. the user never opened /chats)
	const chat =
		findChat(queryClient.getQueryData<ChatListItem[]>(CHAT_LIST_QUERY_KEY)) ??
		findChat((await getChatsAction()).data);

	const notification = new Notification(
		`Neue Nachricht von ${chat?.otherName ?? "Gelöschtes Konto"}`,
		{
			body: `${chat?.listingTitle ?? "Gelöschtes Angebot"}: ${message.content}`,
			tag: message.chatId,
		},
	);

	notification.onclick = () => {
		window.focus();
		onClick(message.chatId);
		notification.close();
	};
}

/**
 * Connects the chat socket and writes its events into the TanStack Query cache, so all chat
 * screens update without reloading; also shows the browser notifications. Returns a function
 * that disconnects and clears the chat data, e.g. on logout.
 */
export function connectChat({
	queryClient,
	userId,
	onNotificationClick,
	onSessionEnded,
}: ConnectChatOptions) {
	const store = useChatStore.getState();
	let connectedBefore = false;
	let sessionEnded = false;

	// The user sees messages in the open chat while the tab is visible
	function isSeen(chatId: string) {
		const { openChatId, tabVisible } = useChatStore.getState();
		return tabVisible && openChatId === chatId;
	}

	function onConnect() {
		store.setConnected(true);
		// Events sent while the connection was down are lost, so everything is reloaded (only
		// what is shown; the rest reloads when it's used again)
		if (connectedBefore) {
			void queryClient.invalidateQueries({ queryKey: CHATS_QUERY_KEY }).then(() => {
				const { openChatId } = useChatStore.getState();
				if (openChatId && isSeen(openChatId)) void markChatRead(queryClient, openChatId);
			});
		}
		connectedBefore = true;
	}

	function onDisconnect(reason: string) {
		store.setConnected(false);

		// The server only ends a connection itself when the login is no longer valid, e.g. after
		// "log out everywhere" on another device. Only once, so a server that keeps rejecting
		// the ticket can't cause a refresh loop.
		if (reason === "io server disconnect" && !sessionEnded) {
			sessionEnded = true;
			onSessionEnded();
		}
	}

	function onNewMessage(message: ChatMessage) {
		const fromOther = message.senderId !== userId;
		const seen = isSeen(message.chatId);
		const inList = isChatInCache(queryClient, message.chatId);

		addMessageToCache(queryClient, message, { unread: fromOther && !seen });
		// First message of a new chat (or one the user deleted): the list item comes from the server
		if (!inList) void queryClient.invalidateQueries({ queryKey: CHAT_LIST_QUERY_KEY });

		if (fromOther) {
			if (seen) void markChatRead(queryClient, message.chatId);
			else void queryClient.invalidateQueries({ queryKey: UNREAD_CHATS_COUNT_QUERY_KEY });
		}

		void showNotification(queryClient, message, onNotificationClick);
	}

	// The user read a chat, possibly in another tab
	function onChatRead({ chatId }: { chatId: string }) {
		setChatUnreadInCache(queryClient, chatId, false);
		void queryClient.invalidateQueries({ queryKey: UNREAD_CHATS_COUNT_QUERY_KEY });
	}

	// The user deleted a chat, possibly in another tab
	function onChatRemoved({ chatId }: { chatId: string }) {
		removeChatFromCache(queryClient, chatId);
		void queryClient.invalidateQueries({ queryKey: UNREAD_CHATS_COUNT_QUERY_KEY });
		// An open chat shows "Dieser Chat wurde gelöscht." and isn't loaded again
		if (useChatStore.getState().openChatId === chatId) store.setRemovedChatId(chatId);
		queryClient.removeQueries({ queryKey: chatQueryKey(chatId) });
	}

	function onVisibilityChange() {
		const visible = !document.hidden;
		store.setTabVisible(visible);

		const { openChatId } = useChatStore.getState();
		if (!visible || !openChatId) return;
		if (!queryClient.getQueryData<ChatDetail>(chatQueryKey(openChatId))) return;

		// Messages that arrived while the tab was hidden are read once the user sees the chat
		const chats = queryClient.getQueryData<ChatListItem[]>(CHAT_LIST_QUERY_KEY);
		const chat = chats?.find((item) => item.id === openChatId);
		if (!chats || chat?.unread) void markChatRead(queryClient, openChatId);
	}

	store.setUserId(userId);
	store.setTabVisible(!document.hidden);
	document.addEventListener("visibilitychange", onVisibilityChange);

	socket.on("connect", onConnect);
	socket.on("disconnect", onDisconnect);
	socket.on("newMessage", onNewMessage);
	socket.on("chatRead", onChatRead);
	socket.on("chatRemoved", onChatRemoved);

	// A fresh ticket for every connection attempt, so reconnects still work after the old one expired
	socket.auth = (send) => {
		getSocketTicketAction()
			.then((result) => send({ ticket: result.data }))
			.catch(() => send({}));
	};
	socket.connect();

	return () => {
		socket.off("connect", onConnect);
		socket.off("disconnect", onDisconnect);
		socket.off("newMessage", onNewMessage);
		socket.off("chatRead", onChatRead);
		socket.off("chatRemoved", onChatRemoved);
		document.removeEventListener("visibilitychange", onVisibilityChange);

		socket.disconnect();
		store.reset();
		// The next user in this tab mustn't see these chats
		queryClient.removeQueries({ queryKey: CHATS_QUERY_KEY });
	};
}

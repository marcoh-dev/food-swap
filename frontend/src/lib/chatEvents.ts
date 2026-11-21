import type { ChatListItem, ChatMessage } from "@food-swap/shared/types";

import { getChatsAction, getSocketTicketAction } from "@/app/chats/actions";
import { notificationsEnabled } from "@/lib/notifications";
import { socket } from "@/socket";
import { useChatStore } from "@/store/chat.store";

type ConnectChatOptions = {
	userId: string;
	onNotificationClick: (chatId: string) => void;
};

// Only for messages from others, and not for the open chat while the tab is visible
async function showNotification(message: ChatMessage, onClick: (chatId: string) => void) {
	if (!notificationsEnabled()) return;

	const { userId, openChatId, tabVisible, chats } = useChatStore.getState();
	if (message.senderId === userId) return;
	if (tabVisible && openChatId === message.chatId) return;

	const findChat = (list?: ChatListItem[] | null) =>
		list?.find((item) => item.id === message.chatId);
	// The chat list may not be loaded yet (e.g. the user never opened /chats)
	const chat = findChat(chats) ?? findChat((await getChatsAction()).data);

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
 * Connects the chat socket and forwards its events to the chat store and the browser
 * notifications. Returns a function that disconnects and resets the store.
 */
export function connectChat({ userId, onNotificationClick }: ConnectChatOptions) {
	const store = useChatStore.getState();

	function onNewMessage(message: ChatMessage) {
		store.receiveMessage(message);
		void showNotification(message, onNotificationClick);
	}

	function onChatRead({ chatId }: { chatId: string }) {
		store.onChatRead(chatId);
	}

	function onChatRemoved({ chatId }: { chatId: string }) {
		store.onChatRemoved(chatId);
	}

	function onVisibilityChange() {
		store.setTabVisible(!document.hidden);
	}

	store.setUserId(userId);
	store.setTabVisible(!document.hidden);
	document.addEventListener("visibilitychange", onVisibilityChange);

	socket.on("connect", store.onConnect);
	socket.on("disconnect", store.onDisconnect);
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
		socket.off("connect", store.onConnect);
		socket.off("disconnect", store.onDisconnect);
		socket.off("newMessage", onNewMessage);
		socket.off("chatRead", onChatRead);
		socket.off("chatRemoved", onChatRemoved);
		document.removeEventListener("visibilitychange", onVisibilityChange);

		socket.disconnect();
		store.reset();
	};
}

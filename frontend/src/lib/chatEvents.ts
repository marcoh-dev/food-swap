import type { ChatListItem, ChatMessage } from "@food-swap/shared/types";

import { getChatsAction } from "@/app/chats/actions";
import { notificationsEnabled } from "@/lib/notifications";
import { socket } from "@/socket";
import { useChatStore } from "@/store/chat.store";

type ConnectChatOptions = {
	token: string;
	userId: string;
	onNotificationClick: (chatId: string) => void;
};

async function showNotification(message: ChatMessage, onClick: (chatId: string) => void) {
	if (!notificationsEnabled()) return;

	const { userId, openChatId, chats } = useChatStore.getState();
	if (message.senderId === userId) return;
	if (!document.hidden && openChatId === message.chatId) return;

	const findChat = (list?: ChatListItem[] | null) =>
		list?.find((item) => item.id === message.chatId);
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

export function connectChat({ token, userId, onNotificationClick }: ConnectChatOptions) {
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

	store.setUserId(userId);

	socket.on("connect", store.onConnect);
	socket.on("disconnect", store.onDisconnect);
	socket.on("newMessage", onNewMessage);
	socket.on("chatRead", onChatRead);
	socket.on("chatRemoved", onChatRemoved);

	socket.auth = { token };
	socket.connect();

	return () => {
		socket.off("connect", store.onConnect);
		socket.off("disconnect", store.onDisconnect);
		socket.off("newMessage", onNewMessage);
		socket.off("chatRead", onChatRead);
		socket.off("chatRemoved", onChatRemoved);

		socket.disconnect();
		store.reset();
	};
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getChatsAction } from "@/app/actions";
import {
	dismissPermissionPrompt,
	notificationsSupported,
	shouldAskForPermission,
} from "@/lib/notifications";
import type { ChatListItem, ChatMessage } from "@/lib/types/chat.types";
import { socket } from "@/socket";
import { useChatStore } from "@/store/chat.store";

export function ChatNotifications() {
	const router = useRouter();

	useEffect(() => {
		if (!shouldAskForPermission()) return;

		toast("Benachrichtigungen aktivieren?", {
			id: "notification-permission",
			description: "Erfahre sofort, wenn dir jemand schreibt.",
			duration: Infinity,
			action: {
				label: "Aktivieren",
				onClick: () => void Notification.requestPermission(),
			},
			cancel: {
				label: "Später",
				onClick: dismissPermissionPrompt,
			},
		});
	}, []);

	useEffect(() => {
		async function notify(message: ChatMessage) {
			if (!notificationsSupported() || Notification.permission !== "granted") return;

			const { userId, conversation, chats } = useChatStore.getState();
			if (message.senderId === userId) return;
			if (!document.hidden && conversation?.id === message.chatId) return;

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
				router.push(`/chats?chat=${message.chatId}`);
				notification.close();
			};
		}

		socket.on("newMessage", notify);

		return () => {
			socket.off("newMessage", notify);
		};
	}, [router]);

	return null;
}

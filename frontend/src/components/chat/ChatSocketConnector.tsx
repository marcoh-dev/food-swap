"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { connectChat } from "@/lib/chatEvents";

type ChatSocketConnectorProps = {
	userId: string | null;
};

export function ChatSocketConnector({ userId }: ChatSocketConnectorProps) {
	const router = useRouter();

	useEffect(() => {
		if (!userId) return;

		return connectChat({
			userId,
			onNotificationClick: (chatId) => router.push(`/chats?chat=${chatId}`),
			// Renders the page and the header again, so they show the logged-out state
			onSessionEnded: () => router.refresh(),
		});
	}, [userId, router]);

	return null;
}

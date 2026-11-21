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
		});
	}, [userId, router]);

	return null;
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { connectChat } from "@/lib/chatEvents";

type ChatSocketConnectorProps = {
	token: string | null;
	userId: string | null;
};

export function ChatSocketConnector({ token, userId }: ChatSocketConnectorProps) {
	const router = useRouter();

	useEffect(() => {
		if (!token || !userId) return;

		return connectChat({
			token,
			userId,
			onNotificationClick: (chatId) => router.push(`/chats?chat=${chatId}`),
		});
	}, [token, userId, router]);

	return null;
}

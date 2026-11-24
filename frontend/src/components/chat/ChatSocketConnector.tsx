"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { clearChatDrafts } from "@/lib/chatDrafts";
import { connectChat } from "@/lib/chatEvents";

type ChatSocketConnectorProps = {
	userId: string | null;
};

export function ChatSocketConnector({ userId }: ChatSocketConnectorProps) {
	const router = useRouter();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!userId) return;

		return connectChat({
			queryClient,
			userId,
			onNotificationClick: (chatId) => router.push(`/chats?chat=${chatId}`),
			// Renders the page and the header again, so they show the logged-out state
			onSessionEnded: () => router.refresh(),
		});
	}, [userId, router, queryClient]);

	// Only when nobody is logged in (e.g. after logging out), not in the socket's cleanup: React
	// also runs that when it remounts components in development, which would delete the drafts
	useEffect(() => {
		if (!userId) clearChatDrafts();
	}, [userId]);

	return null;
}

"use client";

import { useEffect } from "react";

import { useChatStore } from "@/store/chat.store";

type ChatSocketConnectorProps = {
	token: string | null;
	userId: string | null;
};

export function ChatSocketConnector({ token, userId }: ChatSocketConnectorProps) {
	const connect = useChatStore((state) => state.connect);
	const disconnect = useChatStore((state) => state.disconnect);

	useEffect(() => {
		if (!token || !userId) return;

		connect(token, userId);

		return () => {
			disconnect();
		};
	}, [token, userId, connect, disconnect]);

	return null;
}

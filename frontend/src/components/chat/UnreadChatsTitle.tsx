"use client";

import { useEffect } from "react";

import { useChatStore } from "@/store/chat.store";

import { formatUnreadCount } from "./UnreadChatsBadge";

const PREFIX = /^\(\d+\+?\) /;

export function UnreadChatsTitle() {
	const unreadCount = useChatStore((state) => state.unreadCount);

	useEffect(() => {
		const prefix = unreadCount > 0 ? `(${formatUnreadCount(unreadCount)}) ` : "";

		function applyPrefix() {
			const title = prefix + document.title.replace(PREFIX, "");
			if (document.title !== title) document.title = title;
		}

		applyPrefix();

		// Next.js sets a new title on every navigation → add the prefix again
		const observer = new MutationObserver(applyPrefix);
		observer.observe(document.head, { childList: true, subtree: true, characterData: true });

		return () => {
			observer.disconnect();
			document.title = document.title.replace(PREFIX, "");
		};
	}, [unreadCount]);

	return null;
}

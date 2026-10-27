"use client";

import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/store/chat.store";
import { cn } from "cn";

export function UnreadChatsBadge({ className }: { className?: string }) {
	const unreadCount = useChatStore((state) => state.unreadCount);

	if (unreadCount === 0) return null;

	return (
		<Badge className={cn("min-w-5 px-1", className)}>
			<span aria-hidden="true">{unreadCount > 9 ? "9+" : unreadCount}</span>
			<span className="sr-only">
				{unreadCount === 1 ? "1 ungelesener Chat" : `${unreadCount} ungelesene Chats`}
			</span>
		</Badge>
	);
}

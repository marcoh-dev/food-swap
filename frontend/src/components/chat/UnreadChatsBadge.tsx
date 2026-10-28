"use client";

import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/store/chat.store";

export function formatUnreadCount(count: number): string {
	return count > 9 ? "9+" : String(count);
}

export function UnreadChatsBadge({ className }: { className?: string }) {
	const unreadCount = useChatStore((state) => state.unreadCount);

	if (unreadCount === 0) return null;

	return (
		<Badge className={cn("min-w-5 px-1", className)}>
			<span aria-hidden="true">{formatUnreadCount(unreadCount)}</span>
			<span className="sr-only">
				{unreadCount === 1 ? "1 ungelesener Chat" : `${unreadCount} ungelesene Chats`}
			</span>
		</Badge>
	);
}

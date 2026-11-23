import type { ChatListItem } from "@food-swap/shared/types";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { formatLastMessageTime } from "@/lib/date";
import { cn } from "@/lib/utils";

/** What a screen reader reads for a chat row, e.g. "Ungelesen, Jana, Äpfel, Hallo, 14:05". */
export function chatRowLabel(chat: ChatListItem) {
	return [
		chat.unread ? "Ungelesen" : null,
		chat.otherName ?? "Gelöschtes Konto",
		chat.listingTitle ?? "Gelöschtes Angebot",
		chat.lastMessage,
		formatLastMessageTime(chat.lastMessageAt),
	]
		.filter(Boolean)
		.join(", ");
}

/** One chat in the Chats tab: other person, listing, last message, time and an unread dot. */
export function ChatRow({ chat }: { chat: ChatListItem }) {
	const name = chat.otherName ?? "Gelöschtes Konto";
	const listingTitle = chat.listingTitle ?? "Gelöschtes Angebot";
	const time = formatLastMessageTime(chat.lastMessageAt);

	return (
		<View className="gap-0.5 border-b border-border px-6 py-3">
			<View className="flex-row items-baseline justify-between gap-2">
				<View className="min-w-0 flex-1 flex-row items-center gap-1.5">
					{chat.unread && <View className="size-2 rounded-full bg-primary" />}
					<Text
						className={cn("shrink font-medium", chat.unread && "font-bold")}
						numberOfLines={1}
					>
						{name}
					</Text>
				</View>
				<Text variant="muted" className="text-sm">
					{time}
				</Text>
			</View>
			<Text variant="muted" className="text-sm" numberOfLines={1}>
				{listingTitle}
			</Text>
			{chat.lastMessage && (
				<Text className={cn("text-sm", chat.unread && "font-bold")} numberOfLines={1}>
					{chat.lastMessage}
				</Text>
			)}
		</View>
	);
}

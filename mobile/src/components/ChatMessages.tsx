import { formatDate, formatTime, getBerlinDay } from "@food-swap/shared/dates";
import type { ChatMessage } from "@food-swap/shared/types";
import { useMemo } from "react";
import { FlatList, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type ChatMessagesProps = {
	messages: ChatMessage[];
	currentUserId: string | undefined;
	otherName: string;
};

// Day and minute in Berlin time, to group messages sent in the same minute
function sentMinute(message: ChatMessage) {
	return `${getBerlinDay(new Date(message.createdAt))} ${formatTime(message.createdAt)}`;
}

/**
 * The messages of a chat, grouped by day. Consecutive messages of the same person within the same
 * minute show the time only once, below the last of them; each message keeps its own bubble.
 */
export function ChatMessages({ messages, currentUserId, otherName }: ChatMessagesProps) {
	// An inverted list starts at the bottom, where a chat is read, and new messages appear there
	const newestFirst = useMemo(() => [...messages].reverse(), [messages]);

	return (
		<FlatList
			inverted
			className="flex-1"
			contentContainerClassName="px-4 py-4"
			data={newestFirst}
			keyExtractor={({ id }) => id}
			renderItem={({ item, index }) => {
				const older = newestFirst[index + 1];
				const newer = newestFirst[index - 1];
				const own = item.senderId === currentUserId;
				const newDay =
					!older ||
					getBerlinDay(new Date(older.createdAt)) !==
						getBerlinDay(new Date(item.createdAt));
				const showTime =
					!newer ||
					newer.senderId !== item.senderId ||
					sentMinute(newer) !== sentMinute(item);
				const time = formatTime(item.createdAt);

				return (
					<View
						className={cn(older && older.senderId !== item.senderId ? "pt-3" : "pt-1")}
					>
						{newDay && (
							<Text variant="muted" className="self-center pt-2 pb-3 text-xs">
								{formatDate(item.createdAt)}
							</Text>
						)}
						<View
							className={cn(
								"max-w-[80%] gap-0.5",
								own ? "items-end self-end" : "items-start self-start",
							)}
							accessible
							accessibilityLabel={`${own ? "Du" : otherName}: ${item.content}, ${time}`}
						>
							<View
								className={cn(
									"rounded-2xl px-3 py-2",
									own ? "bg-primary" : "bg-muted",
								)}
							>
								{/* 16 px like common messenger apps, smaller than the app's body text */}
								<Text
									className={cn(
										"text-base",
										own ? "text-primary-foreground" : "text-foreground",
									)}
								>
									{item.content}
								</Text>
							</View>
							{showTime && (
								<Text variant="muted" className="text-xs">
									{time}
								</Text>
							)}
						</View>
					</View>
				);
			}}
		/>
	);
}

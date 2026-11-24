import { isSameMessageGroup } from "@food-swap/shared/chat-messages";
import { formatDate, formatTime, getBerlinDay } from "@food-swap/shared/dates";
import type { ChatMessage } from "@food-swap/shared/types";
import { SymbolView } from "expo-symbols";
import { useMemo, useRef, useState } from "react";
import { FlatList, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/useThemeColor";
import { cn } from "@/lib/utils";

type ChatMessagesProps = {
	messages: ChatMessage[];
	currentUserId: string | undefined;
	otherName: string;
	/** Called when the user scrolls away from the newest message or back to it. */
	onAtNewestChange: (atNewest: boolean) => void;
};

// How close to the newest message still counts as "at the newest message", in px
const AT_NEWEST_THRESHOLD = 40;

/**
 * The messages of a chat, grouped by day. Consecutive messages of the same person within the same
 * minute show the time only once, below the last of them; each message keeps its own bubble.
 * While the user is scrolled up, a button points to new messages from the other person.
 */
export function ChatMessages({
	messages,
	currentUserId,
	otherName,
	onAtNewestChange,
}: ChatMessagesProps) {
	// An inverted list starts at the bottom, where a chat is read, and new messages appear there
	const newestFirst = useMemo(() => [...messages].reverse(), [messages]);
	const listRef = useRef<FlatList<ChatMessage>>(null);
	const primaryForeground = useThemeColor("--primary-foreground");
	const [atNewest, setAtNewest] = useState(true);
	// The newest message when the user scrolled away; anything newer arrived meanwhile
	const [newestWhenScrolledAway, setNewestWhenScrolledAway] = useState<string>();
	const newest = newestFirst[0];
	const showNewMessageButton =
		!atNewest &&
		newest !== undefined &&
		newest.id !== newestWhenScrolledAway &&
		newest.senderId !== currentUserId;

	// The list keeps its position when messages arrive, so after sending while scrolled up, jump
	// down to show the own message. The jump waits for the new message's layout: on Android, keeping
	// the position runs after it and would undo an earlier jump.
	const lastNewestId = useRef(newest?.id);

	return (
		<View className="flex-1">
			<FlatList
				ref={listRef}
				onContentSizeChange={() => {
					if (!newest || newest.id === lastNewestId.current) return;

					lastNewestId.current = newest.id;
					if (newest.senderId === currentUserId) {
						listRef.current?.scrollToOffset({ offset: 0, animated: true });
					}
				}}
				inverted
				className="flex-1"
				contentContainerClassName="px-4 py-4"
				data={newestFirst}
				// Inverted: an offset of 0 is the bottom, where the newest message is
				onScroll={(event) => {
					const isAtNewest = event.nativeEvent.contentOffset.y <= AT_NEWEST_THRESHOLD;
					if (isAtNewest === atNewest) return;

					setAtNewest(isAtNewest);
					setNewestWhenScrolledAway(newest?.id);
					onAtNewestChange(isAtNewest);
				}}
				scrollEventThrottle={100}
				// Keeps the messages the user is reading in place when new ones arrive below; at the
				// newest message the list follows new messages instead
				maintainVisibleContentPosition={{
					minIndexForVisible: 0,
					autoscrollToTopThreshold: AT_NEWEST_THRESHOLD,
				}}
				keyExtractor={({ id }) => id}
				renderItem={({ item, index }) => {
					const older = newestFirst[index + 1];
					const newer = newestFirst[index - 1];
					const own = item.senderId === currentUserId;
					const newDay =
						!older ||
						getBerlinDay(new Date(older.createdAt)) !==
							getBerlinDay(new Date(item.createdAt));
					const startsGroup = !older || !isSameMessageGroup(older, item);
					const showTime = !newer || !isSameMessageGroup(item, newer);
					const time = formatTime(item.createdAt);

					return (
						<View
							className={cn(
								// Grouped bubbles sit closer together
								!startsGroup
									? "pt-0.5"
									: older && older.senderId !== item.senderId
										? "pt-5"
										: "pt-3",
							)}
						>
							{newDay && (
								<Text variant="muted" className="self-center pt-2 pb-3 text-xs">
									{formatDate(item.createdAt)}
								</Text>
							)}
							<View
								className={cn(
									"max-w-[80%] gap-1",
									own ? "items-end self-end" : "items-start self-start",
								)}
								accessible
								accessibilityLabel={`${own ? "Du" : otherName}: ${item.content}, ${time}`}
							>
								<View
									className={cn(
										"rounded-2xl px-3 py-2",
										own ? "bg-primary" : "bg-muted",
										// On the sender's side: the last bubble of a group gets a square bottom corner like on
										// the web; where bubbles of a group meet, the corners are only slightly rounded
										own
											? showTime
												? "rounded-br-none"
												: "rounded-br-sm"
											: showTime
												? "rounded-bl-none"
												: "rounded-bl-sm",
										!startsGroup && (own ? "rounded-tr-sm" : "rounded-tl-sm"),
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
									// Indented like the bubble's text, like on the web
									<Text variant="muted" className="px-3 text-xs">
										{time}
									</Text>
								)}
							</View>
						</View>
					);
				}}
			/>
			{showNewMessageButton && (
				<Button
					size="sm"
					// The border in the background colour sets it apart from own bubbles below it
					className="absolute bottom-3 self-center rounded-full border border-background"
					accessibilityHint="Springt zur neuesten Nachricht"
					onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
				>
					<SymbolView
						name={{ ios: "arrow.down", android: "arrow_downward" }}
						size={16}
						tintColor={primaryForeground}
					/>
					<Text>Neue Nachricht</Text>
				</Button>
			)}
		</View>
	);
}

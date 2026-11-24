import type { ChatDetail } from "@food-swap/shared/types";
import { useRouter } from "expo-router";
import { Platform, Pressable, useWindowDimensions, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

// Android: room for the back button and the delete button on each side, so a long title ends
// before the delete button
const HEADER_BUTTON_SPACE = 72;

/**
 * Header of a conversation: the other person and, below, the listing, which opens the listing.
 * Left-aligned next to the back button on Android, centred on iOS, like each platform's messengers.
 */
export function ChatHeaderTitle({ chat }: { chat: ChatDetail | undefined }) {
	const router = useRouter();
	const { width } = useWindowDimensions();

	if (!chat) {
		return <Text className="font-semibold">Chat</Text>;
	}

	const { listingId } = chat;
	const listingTitle = chat.listingTitle ?? "Gelöschtes Angebot";

	return (
		<View
			className={Platform.OS === "android" ? "items-start" : "max-w-64 items-center"}
			style={
				Platform.OS === "android"
					? { maxWidth: width - 2 * HEADER_BUTTON_SPACE }
					: undefined
			}
		>
			<Text
				className={cn("font-semibold", !chat.otherName && "text-muted-foreground")}
				numberOfLines={1}
				accessibilityRole="header"
			>
				{chat.otherName ?? "Gelöschtes Konto"}
			</Text>
			{listingId ? (
				<Pressable
					accessibilityRole="link"
					accessibilityHint="Öffnet das Angebot"
					hitSlop={8}
					onPress={() => router.push(`/listings/${listingId}`)}
				>
					{({ pressed }) => (
						<Text
							variant="muted"
							className={pressed ? "text-xs opacity-70" : "text-xs"}
							numberOfLines={1}
						>
							{listingTitle}
						</Text>
					)}
				</Pressable>
			) : (
				<Text variant="muted" className="text-xs" numberOfLines={1}>
					{listingTitle}
				</Text>
			)}
		</View>
	);
}

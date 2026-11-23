import type { ChatDetail } from "@food-swap/shared/types";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/** Header of a conversation: the other person and, below, the listing, which opens the listing. */
export function ChatHeaderTitle({ chat }: { chat: ChatDetail | undefined }) {
	const router = useRouter();

	if (!chat) {
		return <Text className="font-semibold">Chat</Text>;
	}

	const { listingId } = chat;
	const listingTitle = chat.listingTitle ?? "Gelöschtes Angebot";

	return (
		<View className="max-w-64 items-center">
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

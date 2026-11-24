import { useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, View } from "react-native";

import { ChatInput } from "@/components/ChatInput";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useListingChat } from "@/hooks/useListingChat";
import { useStartChat } from "@/hooks/useStartChat";
import { getChatDraft, listingDraftKey, setChatDraft } from "@/lib/chatDrafts";

type ListingChatCardProps = {
	listingId: string;
	ownerName: string;
};

/**
 * Lets the user write to the person offering a listing, like on the web. With an existing chat
 * it links to it instead; a chat the user deleted earlier can be continued. After sending, the
 * user stays on the listing like on the web.
 */
export function ListingChatCard({ listingId, ownerName }: ListingChatCardProps) {
	const router = useRouter();
	const { data: status, isError } = useListingChat(listingId);
	const startChat = useStartChat(listingId);
	const isOnline = useIsOnline();
	const [content, setContent] = useState(() => getChatDraft(listingDraftKey(listingId)));
	const [sent, setSent] = useState(false);
	const trimmed = content.trim();
	const canSend = trimmed !== "" && isOnline && !startChat.isPending;

	// Without the status, offer a new chat like the web: the backend continues an existing one
	if (!status && !isError) return null;

	const chatId = status?.chatId ?? null;
	// Snug lines in case a long name wraps
	const title = <Text className="font-medium leading-snug">Nachricht an {ownerName}</Text>;

	if (sent) {
		return (
			<View className="gap-1 rounded-lg bg-muted p-4">
				{title}
				<Text variant="muted">Nachricht gesendet.</Text>
			</View>
		);
	}

	if (chatId && !status?.hidden) {
		return (
			<View className="gap-3 rounded-lg bg-muted p-4">
				<Text className="font-medium leading-snug">Chat mit {ownerName}</Text>
				<Button
					variant="outline"
					className="self-start"
					onPress={() => {
						// Opens the chat from the Chats tab, so back leads to the chat list like there;
						// the chat's header links back to the listing
						router.dismissTo("/chats");
						router.push(`/chats/${chatId}`);
					}}
				>
					<Text>Zum Chat</Text>
				</Button>
			</View>
		);
	}

	function send() {
		if (!canSend) return;

		startChat.mutate(trimmed, {
			onSuccess: () => {
				setContent("");
				setSent(true);
				Keyboard.dismiss();
			},
		});
	}

	return (
		<View className="gap-3 rounded-lg bg-muted p-4">
			<View className="gap-1">
				{title}
				<Text variant="muted">
					{chatId
						? "Setze deinen früheren Chat fort."
						: "Frag nach dem Angebot oder vereinbare die Übergabe."}
				</Text>
			</View>
			{startChat.isError && (
				<Text className="text-sm text-destructive" accessibilityRole="alert">
					Die Nachricht konnte nicht gesendet werden. Versuche es nochmal.
				</Text>
			)}
			<ChatInput
				value={content}
				onChangeText={(value) => {
					setContent(value);
					setChatDraft(listingDraftKey(listingId), value);
					if (startChat.isError) startChat.reset();
				}}
				onSend={send}
				canSend={canSend}
				placeholder="Nachricht schreiben…"
			/>
		</View>
	);
}

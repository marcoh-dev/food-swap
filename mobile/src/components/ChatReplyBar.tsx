import { useState } from "react";
import { View } from "react-native";

import { ChatInput } from "@/components/ChatInput";
import { Text } from "@/components/ui/text";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useSendReply } from "@/hooks/useSendReply";
import { getChatDraft, setChatDraft } from "@/lib/chatDrafts";

/**
 * Reply field at the bottom of a conversation. Unsent text stays as a draft per chat (also after
 * leaving the chat or a failed send) until it is sent.
 */
export function ChatReplyBar({ chatId }: { chatId: string }) {
	const [content, setContent] = useState(() => getChatDraft(chatId));
	const sendReply = useSendReply(chatId);
	const isOnline = useIsOnline();
	const trimmed = content.trim();
	const canSend = trimmed !== "" && isOnline && !sendReply.isPending;

	function send() {
		if (!canSend) return;

		sendReply.mutate(trimmed, { onSuccess: () => setContent("") });
	}

	return (
		<View className="gap-2 border-t border-border bg-background px-4 pt-2 pb-safe-offset-2">
			{sendReply.isError && (
				<Text className="text-sm text-destructive" accessibilityRole="alert">
					Die Nachricht konnte nicht gesendet werden. Versuche es nochmal.
				</Text>
			)}
			<ChatInput
				value={content}
				onChangeText={(value) => {
					setContent(value);
					setChatDraft(chatId, value);
					if (sendReply.isError) sendReply.reset();
				}}
				onSend={send}
				canSend={canSend}
				placeholder="Nachricht schreiben…"
			/>
		</View>
	);
}

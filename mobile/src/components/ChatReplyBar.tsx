import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { TextInput, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useSendReply } from "@/hooks/useSendReply";
import { useThemeColor } from "@/hooks/useThemeColor";

// The same limit as the web and the backend
const MAX_LENGTH = 2000;

/** Reply field at the bottom of a conversation; keeps the text if sending fails. */
export function ChatReplyBar({ chatId }: { chatId: string }) {
	const [content, setContent] = useState("");
	const sendReply = useSendReply(chatId);
	const isOnline = useIsOnline();
	const primaryForeground = useThemeColor("--primary-foreground");
	const mutedForeground = useThemeColor("--muted-foreground");
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
			<View className="flex-row items-end gap-2">
				{/* The box draws the field and centres one line; a multi-line text input on iOS keeps
				    a single line at the top otherwise, whatever its padding */}
				<View className="max-h-32 min-h-10 flex-1 justify-center rounded-2xl border border-input bg-background px-3.5 py-2 dark:bg-input/30">
					<TextInput
						// The same text size as the messages. p-0: Android adds padding to multi-line inputs
						className="max-h-28 p-0 text-base text-foreground"
						placeholderTextColor={mutedForeground}
						multiline
						maxLength={MAX_LENGTH}
						placeholder="Nachricht schreiben…"
						accessibilityLabel="Nachricht"
						value={content}
						onChangeText={(value) => {
							setContent(value);
							if (sendReply.isError) sendReply.reset();
						}}
					/>
				</View>
				<Button
					size="icon"
					className="rounded-full"
					disabled={!canSend}
					accessibilityLabel="Senden"
					onPress={send}
				>
					<SymbolView
						name={{ ios: "arrow.right", android: "send" }}
						size={18}
						tintColor={primaryForeground}
					/>
				</Button>
			</View>
		</View>
	);
}

import { SymbolView } from "expo-symbols";
import { TextInput, View } from "react-native";

import { Button } from "@/components/ui/button";
import { useThemeColor } from "@/hooks/useThemeColor";

// The same limit as the web and the backend
const MAX_LENGTH = 2000;

type ChatInputProps = {
	value: string;
	onChangeText: (value: string) => void;
	onSend: () => void;
	canSend: boolean;
	placeholder: string;
};

/** A message field that grows with its text, and a send button next to it. */
export function ChatInput({ value, onChangeText, onSend, canSend, placeholder }: ChatInputProps) {
	const primaryForeground = useThemeColor("--primary-foreground");
	const mutedForeground = useThemeColor("--muted-foreground");

	return (
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
					placeholder={placeholder}
					accessibilityLabel="Nachricht"
					value={value}
					onChangeText={onChangeText}
				/>
			</View>
			<Button
				size="icon"
				className="rounded-full"
				disabled={!canSend}
				accessibilityLabel="Senden"
				onPress={onSend}
			>
				<SymbolView
					name={{ ios: "arrow.right", android: "send" }}
					size={18}
					tintColor={primaryForeground}
				/>
			</Button>
		</View>
	);
}

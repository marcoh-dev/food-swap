import { SymbolView } from "expo-symbols";
import { Alert, Platform, Pressable } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

type DeleteChatButtonProps = {
	onDelete: () => void;
	disabled: boolean;
};

/** Header button that asks before deleting a chat, with the same texts as the web. */
export function DeleteChatButton({ onDelete, disabled }: DeleteChatButtonProps) {
	const foreground = useThemeColor("--foreground");
	const mutedForeground = useThemeColor("--muted-foreground");

	function confirm() {
		Alert.alert(
			"Diesen Chat löschen?",
			"Der Chat verschwindet aus deiner Liste. Die andere Person behält ihn, bis sie ihn auch löscht.",
			[
				{ text: "Abbrechen", style: "cancel" },
				{ text: "Löschen", style: "destructive", onPress: onDelete },
			],
		);
	}

	return (
		<Pressable
			onPress={confirm}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityLabel="Chat löschen"
			accessibilityState={{ disabled }}
			hitSlop={8}
		>
			<SymbolView
				name={{ ios: "trash", android: "delete" }}
				tintColor={disabled ? mutedForeground : foreground}
				size={Platform.select({ ios: 17, default: 24 })}
			/>
		</Pressable>
	);
}

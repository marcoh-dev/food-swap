import { SymbolView } from "expo-symbols";
import { ActivityIndicator, Platform, Pressable } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/useThemeColor";
import { cn } from "@/lib/utils";

type Props = {
	onPress: () => void;
	disabled?: boolean;
	/** Shows a spinner instead, e.g. while saving; also disables the button. */
	busy?: boolean;
};

/**
 * The save button on the right of a form modal's header, as each platform's own apps do it: a ✓ on
 * iOS (the same size as `CloseButton` on the left), "Speichern" as text on Android.
 */
export function HeaderSaveButton({ onPress, disabled = false, busy = false }: Props) {
	const foreground = useThemeColor("--foreground");
	const mutedForeground = useThemeColor("--muted-foreground");
	const isDisabled = disabled || busy;

	let content;
	if (busy) {
		content = <ActivityIndicator color={mutedForeground} />;
	} else if (Platform.OS === "ios") {
		content = (
			<SymbolView
				name="checkmark"
				tintColor={isDisabled ? mutedForeground : foreground}
				size={17}
			/>
		);
	} else {
		content = (
			<Text className={cn("font-semibold", isDisabled && "text-muted-foreground")}>
				Speichern
			</Text>
		);
	}

	return (
		<Pressable
			onPress={onPress}
			disabled={isDisabled}
			accessibilityRole="button"
			accessibilityLabel="Speichern"
			accessibilityState={{ disabled: isDisabled, busy }}
			hitSlop={8}
		>
			{content}
		</Pressable>
	);
}

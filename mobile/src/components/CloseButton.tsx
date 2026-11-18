import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Platform, Pressable } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export function CloseButton() {
	const foreground = useThemeColor("--foreground");

	return (
		<Pressable
			onPress={() => router.back()}
			className={Platform.select({ android: "mr-8" })}
			accessibilityRole="button"
			accessibilityLabel="Schließen"
			hitSlop={8}
		>
			<SymbolView
				name={{ ios: "xmark", android: "close" }}
				tintColor={foreground}
				size={Platform.select({ ios: 17, default: 24 })}
			/>
		</Pressable>
	);
}

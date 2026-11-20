import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { type ReactNode, useEffect } from "react";
import { AccessibilityInfo, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/useThemeColor";

type Props = {
	icon: SymbolViewProps["name"];
	variant?: "info" | "destructive";
	title: string;
	message: string;
	children?: ReactNode;
};

export function Notice({ icon, variant = "info", title, message, children }: Props) {
	const iconColor = useThemeColor(variant === "destructive" ? "--destructive" : "--info");
	const label = `${title}. ${message}`;

	useEffect(() => {
		AccessibilityInfo.announceForAccessibility(label);
	}, [label]);

	return (
		<View className="flex-row gap-3 rounded-lg bg-muted p-4">
			<View className="h-8 justify-center">
				<SymbolView name={icon} size={20} tintColor={iconColor} />
			</View>
			<View className="flex-1 gap-3">
				<View
					className="gap-1"
					accessible
					accessibilityRole="alert"
					accessibilityLabel={label}
				>
					<Text className="font-medium">{title}</Text>
					<Text variant="muted">{message}</Text>
				</View>
				{children}
			</View>
		</View>
	);
}

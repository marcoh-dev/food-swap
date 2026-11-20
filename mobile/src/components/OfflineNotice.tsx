import { useEffect } from "react";
import { AccessibilityInfo, View } from "react-native";

import { Text } from "@/components/ui/text";

const TITLE = "Du bist offline";

type Props = {
	message: string;
};

export function OfflineNotice({ message }: Props) {
	const label = `${TITLE}. ${message}`;

	useEffect(() => {
		AccessibilityInfo.announceForAccessibility(label);
	}, [label]);

	return (
		<View
			className="gap-1 rounded-lg bg-muted p-4"
			accessible
			accessibilityRole="alert"
			accessibilityLabel={label}
		>
			<Text className="font-medium">{TITLE}</Text>
			<Text variant="muted">{message}</Text>
		</View>
	);
}

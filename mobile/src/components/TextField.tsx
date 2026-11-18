import { type TextInputProps, View } from "react-native";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type Props = TextInputProps & { label: string; error?: string };

export function TextField({ label, error, ...props }: Props) {
	return (
		<View className="gap-2">
			<Text variant="small">{label}</Text>
			<Input accessibilityLabel={label} invalid={Boolean(error)} {...props} />
			{error ? <Text className="text-body-small text-destructive">{error}</Text> : null}
		</View>
	);
}

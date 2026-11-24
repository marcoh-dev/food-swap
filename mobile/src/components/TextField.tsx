import { type TextInputProps, View } from "react-native";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type Props = TextInputProps & { label: string; description?: string; error?: string };

export function TextField({ label, description, error, ...props }: Props) {
	return (
		<View className="gap-2">
			<View className="gap-1">
				<Text variant="small">{label}</Text>
				{description ? <Text variant="muted">{description}</Text> : null}
			</View>
			<Input
				accessibilityLabel={label}
				accessibilityHint={description}
				invalid={Boolean(error)}
				{...props}
			/>
			{error ? <Text className="text-body-small text-destructive">{error}</Text> : null}
		</View>
	);
}

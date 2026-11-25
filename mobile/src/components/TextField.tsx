import type { ReactNode } from "react";
import { type TextInputProps, View } from "react-native";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type Props = TextInputProps & {
	label: string;
	description?: string;
	error?: string;
	/** Shown inside the field on the right, e.g. a button that shows the password. */
	accessory?: ReactNode;
};

/** A text input with a label above it and an optional description and error text. */
export function TextField({ label, description, error, accessory, ...props }: Props) {
	return (
		<View className="gap-2">
			<View className="gap-1">
				<Text variant="small">{label}</Text>
				{description ? <Text variant="muted">{description}</Text> : null}
			</View>
			<View className="justify-center">
				<Input
					accessibilityLabel={label}
					accessibilityHint={description}
					invalid={Boolean(error)}
					className={accessory ? "pr-11" : undefined}
					{...props}
				/>
				{accessory ? <View className="absolute right-0">{accessory}</View> : null}
			</View>
			{error ? <Text className="text-body-small text-destructive">{error}</Text> : null}
		</View>
	);
}

import type { ReactNode } from "react";
import { type TextInputProps, View } from "react-native";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";

type Props = TextInputProps & {
	label: string;
	description?: string;
	error?: string;
	/** Shown inside the field on the right, e.g. a button that shows the password. */
	accessory?: ReactNode;
};

/** A text input with a label above it, and an optional description and error text below it. */
export function TextField({ label, description, error, accessory, multiline, ...props }: Props) {
	const Field = multiline ? Textarea : Input;
	return (
		<View className="gap-2">
			<Text variant="small">{label}</Text>
			<View className="justify-center">
				<Field
					accessibilityLabel={label}
					accessibilityHint={description}
					invalid={Boolean(error)}
					className={accessory ? "pr-11" : undefined}
					{...props}
				/>
				{accessory ? <View className="absolute right-0">{accessory}</View> : null}
			</View>
			{/* Below the field like on the web; the screen reader reads it with the field (hint) */}
			{description ? <Text variant="muted">{description}</Text> : null}
			{error ? <Text className="text-body-small text-destructive">{error}</Text> : null}
		</View>
	);
}

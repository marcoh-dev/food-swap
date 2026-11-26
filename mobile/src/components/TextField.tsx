import type { ReactNode, Ref } from "react";
import { type TextInputInstance, type TextInputProps, View } from "react-native";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type Props = TextInputProps & {
	label: string;
	description?: string;
	error?: string;
	/** Shown inside the field on the right, e.g. a button that shows the password. */
	accessory?: ReactNode;
	/** Shown directly below the field, before the description and error, e.g. search results. */
	children?: ReactNode;
	/** The input itself, e.g. to focus it. */
	ref?: Ref<TextInputInstance>;
};

/** A text input with a label above it, and an optional description and error text below it. */
export function TextField({ label, description, error, accessory, children, ...props }: Props) {
	return (
		<View className="gap-2">
			<Text variant="small">{label}</Text>
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
			{children}
			{/* Below the field like on the web; the screen reader reads it with the field (hint) */}
			{description ? <Text variant="muted">{description}</Text> : null}
			{error ? <Text className="text-body-small text-destructive">{error}</Text> : null}
		</View>
	);
}

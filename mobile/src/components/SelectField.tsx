import { SymbolView } from "expo-symbols";
import type { ComponentProps, ReactNode } from "react";
import { Keyboard, Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/useThemeColor";
import { cn } from "@/lib/utils";

export type SelectOption = {
	value: string;
	label: string;
};

export type SelectProps = {
	label: string;
	options: SelectOption[];
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	error?: string;
};

type FieldProps = {
	label: string;
	error?: string;
	children: ReactNode;
};

/** The label above and the error text below a select, the same on iOS and Android. */
export function SelectField({ label, error, children }: FieldProps) {
	return (
		<View className="gap-2">
			<Text variant="small">{label}</Text>
			{children}
			{error ? <Text className="text-body-small text-destructive">{error}</Text> : null}
		</View>
	);
}

type TriggerProps = ComponentProps<typeof Pressable> & {
	label: string;
	/** The label of the chosen option; the placeholder is shown without one. */
	selectedLabel?: string;
	placeholder?: string;
	error?: string;
};

/** The box that shows the chosen option and opens the menu; looks like a text field. */
export function SelectTrigger({
	label,
	selectedLabel,
	placeholder,
	error,
	className,
	...props
}: TriggerProps) {
	const mutedForeground = useThemeColor("--muted-foreground");

	return (
		<Pressable
			// The keyboard goes away when the menu opens
			onPressIn={() => Keyboard.dismiss()}
			// The dropdown trigger passes onPress and a ref here, so the menu opens
			{...props}
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityValue={{ text: selectedLabel }}
			className={cn(
				"h-10 w-full flex-row items-center justify-between gap-2 rounded-md border border-input bg-background px-3 shadow-sm shadow-black/5 dark:bg-input/30",
				error && "border-destructive",
				className,
			)}
		>
			<Text
				className={cn(
					"flex-1",
					selectedLabel ? "text-foreground" : "text-muted-foreground",
				)}
			>
				{selectedLabel ?? placeholder}
			</Text>
			<SymbolView
				name={{ ios: "chevron.up.chevron.down", android: "unfold_more" }}
				size={14}
				tintColor={mutedForeground}
			/>
		</Pressable>
	);
}

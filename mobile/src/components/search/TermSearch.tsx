import { SymbolView } from "expo-symbols";
import { useRef } from "react";
import { Pressable, type TextInputInstance, View } from "react-native";

import { Input } from "@/components/ui/input";
import { useThemeColor } from "@/hooks/useThemeColor";

type Props = {
	value: string;
	onChangeText: (text: string) => void;
	onSubmit: () => void;
	onClear: () => void;
};

export function TermSearch({ value, onChangeText, onSubmit, onClear }: Props) {
	const mutedForeground = useThemeColor("--muted-foreground");
	const inputRef = useRef<TextInputInstance>(null);

	return (
		<View className="justify-center">
			<Input
				ref={inputRef}
				value={value}
				onChangeText={onChangeText}
				onSubmitEditing={onSubmit}
				returnKeyType="search"
				placeholder="Wonach suchst du?"
				accessibilityLabel="Suchbegriff"
				maxLength={100}
				autoCorrect={false}
				className="pr-11 pl-9"
			/>
			{/* Lies over the field's left edge; taps on it go through to the input */}
			<View pointerEvents="none" className="absolute left-3">
				<SymbolView
					name={{ ios: "magnifyingglass", android: "search" }}
					size={16}
					tintColor={mutedForeground}
				/>
			</View>
			{value ? (
				<Pressable
					onPress={() => {
						onClear();
						// Ready to type a new term right away (iOS would otherwise leave the field)
						inputRef.current?.focus();
					}}
					accessibilityRole="button"
					accessibilityLabel="Suchbegriff löschen"
					hitSlop={8}
					className="absolute right-0 h-10 w-11 items-center justify-center"
				>
					<SymbolView
						name={{ ios: "xmark.circle.fill", android: "cancel" }}
						size={18}
						tintColor={mutedForeground}
					/>
				</Pressable>
			) : null}
		</View>
	);
}

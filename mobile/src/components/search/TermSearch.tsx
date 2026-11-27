import { SymbolView } from "expo-symbols";
import { View } from "react-native";

import { Input } from "@/components/ui/input";
import { useThemeColor } from "@/hooks/useThemeColor";

type Props = {
	value: string;
	onChangeText: (text: string) => void;
	onSubmit: () => void;
};

export function TermSearch({ value, onChangeText, onSubmit }: Props) {
	const mutedForeground = useThemeColor("--muted-foreground");
	return (
		<View className="justify-center">
			<Input
				value={value}
				onChangeText={onChangeText}
				onSubmitEditing={onSubmit}
				returnKeyType="search"
				placeholder="Wonach suchst du?"
				accessibilityLabel="Suchbegriff"
				maxLength={100}
				autoCorrect={false}
				className="pl-9"
			/>
			{/* Lies over the field's left edge; taps on it go through to the input */}
			<View pointerEvents="none" className="absolute left-3">
				<SymbolView
					name={{ ios: "magnifyingglass", android: "search" }}
					size={16}
					tintColor={mutedForeground}
				/>
			</View>
		</View>
	);
}

import { Input } from "@/components/ui/input";

type Props = {
	value: string;
	onChangeText: (text: string) => void;
	onSubmit: () => void;
};

export function TermSearch({ value, onChangeText, onSubmit }: Props) {
	return (
		<Input
			value={value}
			onChangeText={onChangeText}
			onSubmitEditing={onSubmit}
			returnKeyType="search"
			placeholder="Was suchst du?"
			accessibilityLabel="Suchbegriff"
			maxLength={100}
			autoCorrect={false}
		/>
	);
}

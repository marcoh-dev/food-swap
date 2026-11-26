import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type Option = {
	value: string;
	label: string;
};

type Props = {
	label: string;
	options: Option[];
	value: string;
	onValueChange: (value: string) => void;
	error?: string;
};

export function RadioGroup({ label, options, value, onValueChange, error }: Props) {
	return (
		<View className="gap-2">
			<Text variant="small">{label}</Text>
			<View accessibilityRole="radiogroup" className="flex-row gap-6">
				{options.map((option) => {
					const checked = option.value === value;

					return (
						<Pressable
							key={option.value}
							accessibilityRole="radio"
							accessibilityState={{ checked }}
							onPress={() => onValueChange(option.value)}
							className="min-h-11 flex-row items-center gap-2"
						>
							<View
								className={cn(
									"size-5 items-center justify-center rounded-full border border-input bg-background",
									checked && "border-primary",
									error && "border-destructive",
								)}
							>
								{checked ? (
									<View className="size-2.5 rounded-full bg-primary" />
								) : null}
							</View>
							<Text>{option.label}</Text>
						</Pressable>
					);
				})}
			</View>
			{error ? <Text className="text-body-small text-destructive">{error}</Text> : null}
		</View>
	);
}

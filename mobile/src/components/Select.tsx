import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Keyboard, Modal, Pressable, ScrollView, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/useThemeColor";
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
	placeholder?: string;
	error?: string;
};

export function Select({ label, options, value, placeholder, error, onValueChange }: Props) {
	const [open, setOpen] = useState(false);
	const foreground = useThemeColor("--foreground");
	const selected = options.find((option) => option.value === value);

	return (
		<View className="gap-2">
			<Text variant="small">{label}</Text>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={label}
				accessibilityValue={{ text: selected?.label }}
				onPress={() => {
					Keyboard.dismiss();
					setOpen(true);
				}}
				className={cn(
					"h-10 w-full justify-center rounded-md border border-input bg-background px-3 shadow-sm shadow-black/5 dark:bg-input/30",
					error && "border-destructive",
				)}
			>
				<Text className={selected ? "text-foreground" : "text-muted-foreground"}>
					{selected?.label ?? placeholder}
				</Text>
			</Pressable>
			<Modal
				visible={open}
				transparent
				animationType="fade"
				onRequestClose={() => setOpen(false)}
			>
				<Pressable
					className="flex-1 justify-center bg-black/50 p-6"
					onPress={() => setOpen(false)}
				>
					<View className="max-h-96 overflow-hidden rounded-md border border-border bg-background">
						<ScrollView>
							{options.map((option) => {
								const isSelected = option.value === value;

								return (
									<Pressable
										key={option.value}
										accessibilityRole="radio"
										accessibilityState={{ selected: isSelected }}
										onPress={() => {
											onValueChange(option.value);
											setOpen(false);
										}}
										className={cn(
											"h-12 flex-row items-center justify-between px-4 active:bg-accent",
											isSelected && "bg-accent",
										)}
									>
										<Text className={isSelected ? "font-semibold" : undefined}>
											{option.label}
										</Text>
										{isSelected ? (
											<SymbolView
												name={{ ios: "checkmark", android: "check" }}
												size={18}
												tintColor={foreground}
											/>
										) : null}
									</Pressable>
								);
							})}
						</ScrollView>
					</View>
				</Pressable>
			</Modal>
			{error ? <Text className="text-body-small text-destructive">{error}</Text> : null}
		</View>
	);
}

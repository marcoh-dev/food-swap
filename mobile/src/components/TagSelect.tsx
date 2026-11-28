import type { Tag } from "@food-swap/shared/types";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type Props = {
	tags: Tag[];
	value: string[];
	onChange: (tagIds: string[]) => void;
};

export function TagSelect({ tags, value, onChange }: Props) {
	function toggle(tagId: string) {
		onChange(value.includes(tagId) ? value.filter((id) => id !== tagId) : [...value, tagId]);
	}

	return (
		<View accessibilityLabel="Tags" className="flex-row flex-wrap gap-2">
			{tags.map((tag) => {
				const checked = value.includes(tag.id);

				return (
					<Pressable
						key={tag.id}
						accessibilityRole="checkbox"
						accessibilityState={{ checked }}
						onPress={() => toggle(tag.id)}
						className={cn(
							"min-h-9 justify-center rounded-sm border border-input bg-background px-3 dark:bg-input/30",
							checked && "border-foreground bg-foreground dark:bg-foreground",
						)}
					>
						<Text className={cn("text-sm", checked && "text-background")}>
							{tag.name}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

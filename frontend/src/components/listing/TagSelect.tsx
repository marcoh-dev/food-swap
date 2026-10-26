"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Tag } from "@/lib/types/tag.types";

type Props = {
	tags: Tag[];
	value: string[];
	onChange: (tagIds: string[]) => void;
	valueKey?: "id" | "slug";
};

export default function TagSelect({ tags, value, onChange, valueKey = "id" }: Props) {
	return (
		<ToggleGroup
			type="multiple"
			variant="outline"
			value={value}
			onValueChange={onChange}
			className="flex-wrap justify-start"
			aria-label="Tags"
		>
			{tags.map((tag) => (
				<ToggleGroupItem
					key={tag.id}
					value={tag[valueKey]}
					className="dark:bg-input/30 data-[state=on]:bg-category data-[state=on]:text-category-foreground rounded-sm"
				>
					{tag.name}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

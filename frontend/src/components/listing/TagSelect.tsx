"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Tag } from "@/lib/types/tag.types";

type Props = {
	tags: Tag[];
	value: string[];
	onChange: (tagIds: string[]) => void;
};

export default function TagSelect({ tags, value, onChange }: Props) {
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
					value={tag.id}
					className="data-[state=on]:bg-category data-[state=on]:text-category-foreground"
				>
					{tag.name}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

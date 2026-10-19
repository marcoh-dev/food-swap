"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Tag } from "@/lib/types/tag.types";

type Props = {
	tags: Tag[];
	defaultValue?: string[];
};

export default function TagSelect({ tags, defaultValue = [] }: Props) {
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>(defaultValue);

	return (
		<>
			<ToggleGroup
				type="multiple"
				variant="outline"
				value={selectedTagIds}
				onValueChange={setSelectedTagIds}
				className="flex-wrap justify-start"
				aria-label="Tags"
			>
				{tags.map((tag) => (
					<ToggleGroupItem
						key={tag.id}
						value={tag.id}
						className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
					>
						{tag.name}
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			{selectedTagIds.map((tagId) => (
				<input key={tagId} type="hidden" name="tagIds" value={tagId} />
			))}
		</>
	);
}

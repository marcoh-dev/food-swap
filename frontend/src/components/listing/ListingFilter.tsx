"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types/category.types";
import type { Tag } from "@/lib/types/tag.types";

import TagSelect from "./TagSelect";

const ALL_CATEGORIES = "all";
type Props = {
	categories: Category[];
	tags: Tag[];
};

export default function ListingFilters({ categories, tags }: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const selectedCategory = searchParams.get("category") ?? "";
	const tagsParam = searchParams.get("tags");
	const selectedTags = tagsParam ? tagsParam.split(",") : [];

	function updateUrl(name: string, value: string) {
		const params = new URLSearchParams(searchParams.toString());

		if (value === "") {
			params.delete(name);
		} else {
			params.set(name, value);
		}

		params.delete("page");
		router.push(`${pathname}?${params.toString()}`);
	}

	function handleCategoryChange(value: string) {
		if (value === ALL_CATEGORIES) {
			updateUrl("category", "");
		} else {
			updateUrl("category", value);
		}
	}

	function handleTagToggle(slugs: string[]) {
		updateUrl("tags", slugs.join(","));
	}

	function handleReset() {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("category");
		params.delete("tags");
		params.delete("page");
		router.push(`${pathname}?${params.toString()}`);
	}

	const hasFilters = selectedCategory !== "" || selectedTags.length > 0;

	return (
		<div className="my-3 flex flex-col gap-4">
			<div className="grid gap-1.5">
				<Label htmlFor="category-filter" className="sr-only">
					Kategorie
				</Label>
				<Select
					value={selectedCategory || ALL_CATEGORIES}
					onValueChange={handleCategoryChange}
				>
					<SelectTrigger id="category-filter" className="w-full max-w-40">
						<SelectValue placeholder="Kategorie wählen" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ALL_CATEGORIES}>Alle Kategorien</SelectItem>
						{categories.map((category) => (
							<SelectItem key={category.id} value={category.slug}>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<FieldSet>
				<FieldLegend variant="label" className="sr-only">
					Tags
				</FieldLegend>
				<TagSelect
					tags={tags}
					value={selectedTags}
					onChange={handleTagToggle}
					valueKey="slug"
				/>
			</FieldSet>

			{hasFilters && (
				<Button
					type="button"
					variant="outline"
					onClick={handleReset}
					className="self-start"
				>
					Filter zurücksetzen
				</Button>
			)}
		</div>
	);
}

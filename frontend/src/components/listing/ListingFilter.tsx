"use client";

import type { Category } from "@/lib/types/category.types";
import type { Tag } from "@/lib/types/tag.types";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

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

	function handleTagToggle(slug: string) {
		let newTags: string[];

		if (selectedTags.includes(slug)) {
			newTags = selectedTags.filter((tag) => tag !== slug);
		} else {
			newTags = [...selectedTags, slug];
		}

		updateUrl("tags", newTags.join(","));
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
		<div className="flex flex-col gap-4 my-4">
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

			<fieldset className="grid gap-2">
				<legend className="sr-only">Tags</legend>
				<div className="flex flex-wrap gap-x-4 gap-y-2">
					{tags.map((tag) => {
						const checkboxId = `tag-filter-${tag.slug}`;

						return (
							<div key={tag.id} className="flex items-center gap-2">
								<Checkbox
									id={checkboxId}
									checked={selectedTags.includes(tag.slug)}
									onCheckedChange={() => handleTagToggle(tag.slug)}
									className="data-checked:bg-category data-checked:text-category-foreground data-checked:border-category-foreground dark:data-checked:bg-category dark:data-checked:text-category-foreground dark:data-checked:border-category-foreground"
								/>
								<Label htmlFor={checkboxId} className="font-normal">
									{tag.name}
								</Label>
							</div>
						);
					})}
				</div>
			</fieldset>

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

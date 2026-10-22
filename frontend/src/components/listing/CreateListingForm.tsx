"use client";

import { createListingAction } from "@/app/actions";
import ListingForm from "./ListingForm";
import type { Category } from "@/lib/types/category.types";
import type { Tag } from "@/lib/types/tag.types";
import type { Place } from "@/lib/types/place.types";

type Props = {
	categories: Category[];
	tags: Tag[];
	defaultPlace?: Place | null;
};

export default function CreateListingForm({ categories, tags, defaultPlace }: Props) {
	return (
		<ListingForm
			action={createListingAction}
			categories={categories}
			tags={tags}
			defaultPlace={defaultPlace}
		/>
	);
}

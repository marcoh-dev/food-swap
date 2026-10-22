"use client";

import { createListingAction } from "@/app/actions";
import ListingForm from "./ListingForm";
import type { Category } from "@/lib/types/category.types";
import type { Tag } from "@/lib/types/tag.types";

type Props = {
	categories: Category[];
	tags: Tag[];
};

export default function CreateListingForm({ categories, tags }: Props) {
	return <ListingForm action={createListingAction} categories={categories} tags={tags} />;
}

"use client";

import { createListingAction } from "@/app/actions";
import { useActionState } from "react";
import ListingForm from "./ListingForm";
import type { Category } from "@/lib/types/category.types";
import type { Tag } from "@/lib/types/tag.types";

type Props = {
	categories: Category[];
	tags: Tag[];
};

export default function CreateListingForm({ categories, tags }: Props) {
	const [state, formAction] = useActionState(createListingAction, {});

	return (
		<>
			{state.error && (
				<p role="alert" className="text-destructive">
					{state.error}
				</p>
			)}
			<ListingForm action={formAction} categories={categories} tags={tags} />
		</>
	);
}

"use client";

import type { Category, Place, Tag } from "@food-swap/shared/types";
import Link from "next/link";

import { createListingAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

import ListingForm from "./ListingForm";

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
			twoColumns
		>
			<Button variant="ghost" asChild className="w-full rounded-lg px-3 py-2 lg:w-auto">
				<Link href="/me">Abbrechen</Link>
			</Button>
		</ListingForm>
	);
}

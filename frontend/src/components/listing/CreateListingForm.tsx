"use client";

import Link from "next/link";

import { createListingAction } from "@/app/actions";
import type { Category } from "@/lib/types/category.types";
import type { Place } from "@/lib/types/place.types";
import type { Tag } from "@/lib/types/tag.types";

import ListingForm from "./ListingForm";
import { Button } from "../ui/button";

type Props = {
	categories: Category[];
	tags: Tag[];
	defaultPlace?: Place | null;
};

export default function CreateListingForm({ categories, tags, defaultPlace }: Props) {
	return (
		<>
			<ListingForm
				action={createListingAction}
				categories={categories}
				tags={tags}
				defaultPlace={defaultPlace}
			/>
			<Button variant="ghost" asChild className="rounded-lg px-3 py-2 w-full">
				<Link href="/me">Abbrechen</Link>
			</Button>
		</>
	);
}

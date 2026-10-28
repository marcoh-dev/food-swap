"use client";

import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { deleteListingAction, updateListingAction, updateListingStatusAction } from "@/app/actions";
import ListingForm from "@/components/listing/ListingForm";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ListingFormValues } from "@/lib/schemas/listing.schemas";
import type { Category } from "@/lib/types/category.types";
import type { ListingResponse, ListingStatus } from "@/lib/types/listing.types";
import type { Tag } from "@/lib/types/tag.types";
import { getBerlinDay } from "@/utils/date";

import ListingStatusMenu from "./ListingStatusMenu";

export default function ListingActions({
	listing,
	categories,
	tags,
	isEditingInList = false,
	initialEditing = false,
	layout = "grid",
}: {
	listing: ListingResponse;
	categories: Category[];
	tags: Tag[];
	isEditingInList?: boolean;
	initialEditing?: boolean;
	layout?: "list" | "grid";
}) {
	const [isEditing, setIsEditing] = useState(initialEditing);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	function scrollToImage() {
		document
			.getElementById("listing-image")
			?.scrollIntoView({ block: "start", behavior: "smooth" });
	}

	async function handleUpdate(values: ListingFormValues) {
		const result = await updateListingAction(listing.id, values);

		if (!result.error && !result.fieldErrors) {
			setIsEditing(false);
			scrollToImage();
		}

		return result;
	}

	function handleCancel() {
		setErrorMessage(null);
		setIsEditing(false);
		scrollToImage();
	}

	function handleDelete() {
		deleteListingAction(listing.id);
	}

	async function handleStatusChange(targetStatus: ListingStatus) {
		const result = await updateListingStatusAction(listing.id, targetStatus);

		if (result.error) {
			setErrorMessage(result.error);
			return;
		}

		setErrorMessage(null);
	}

	if (isEditing) {
		return (
			<div>
				<ListingForm
					action={handleUpdate}
					categories={categories}
					tags={tags}
					defaultValues={{
						title: listing.title,
						description: listing.description,
						image: listing.image ?? "",
						placeId: listing.place.id,
						categoryId: listing.category?.id ?? "",
						type: listing.type,
						tagIds: listing.tags.map((tag) => tag.id),
						endDate: getBerlinDay(new Date(listing.endDate)),
					}}
					defaultPlace={listing.place}
					submitLabel="Speichern"
					heading="Anzeige bearbeiten"
					autoFocus
				/>

				<Button
					type="button"
					variant="ghost"
					onClick={handleCancel}
					className="w-full rounded-lg px-3 py-2"
				>
					Abbrechen
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex gap-2">
				{isEditingInList ? (
					<Button variant="secondary" asChild>
						<Link href={`/listings/${listing.id}?edit=true`}>
							<PencilIcon className="size-4" aria-hidden="true" />
							<span
								className={layout === "list" ? undefined : "sr-only md:not-sr-only"}
							>
								Bearbeiten
							</span>
						</Link>
					</Button>
				) : (
					<Button variant="secondary" onClick={() => setIsEditing(true)}>
						<PencilIcon className="size-4" aria-hidden="true" />
						Bearbeiten
					</Button>
				)}

				<ListingStatusMenu
					status={listing.status}
					onStatusChange={handleStatusChange}
					onDeleteClick={() => setIsDeleteDialogOpen(true)}
				/>
			</div>

			{errorMessage && <p className="text-destructive">{errorMessage}</p>}

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Anzeige wirklich löschen?</AlertDialogTitle>
						<AlertDialogDescription>
							Dieser Schritt kann nicht rückgängig gemacht werden.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Abbrechen</AlertDialogCancel>
						<AlertDialogAction variant="destructive" onClick={handleDelete}>
							Endgültig löschen
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

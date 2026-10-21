"use client";

import { useState } from "react";
import { PencilIcon } from "lucide-react";
import ListingForm from "@/components/listing/ListingForm";
import { updateListingAction, deleteListingAction, updateListingStatusAction } from "@/app/actions";
import type { ListingResponse, ListingStatus } from "@/lib/types/listing.types";
import type { Category } from "@/lib/types/category.types";
import type { Tag } from "@/lib/types/tag.types";
import { Button } from "@/components/ui/button";
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
import ListingStatusMenu from "./ListingStatusMenu";

export default function ListingActions({
	listing,
	categories,
	tags,
}: {
	listing: ListingResponse;
	categories: Category[];
	tags: Tag[];
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	async function handleUpdate(formData: FormData) {
		const result = await updateListingAction(listing.id, formData);

		if (result.error) {
			setErrorMessage(result.error);
			return;
		}

		setErrorMessage(null);
		setIsEditing(false);
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

	function handleCancel() {
		setErrorMessage(null);
		setIsEditing(false);
	}

	if (isEditing) {
		return (
			<div>
				<ListingForm
					action={handleUpdate}
					categories={categories}
					tags={tags}
					defaultValues={{
						...listing,
						categoryId: listing.category?.id ?? null,
						tagIds: listing.tags.map((tag) => tag.id),
					}}
					submitLabel="Speichern"
					error={errorMessage ?? undefined}
				/>

				<Button
					type="button"
					variant="ghost"
					onClick={handleCancel}
					className="rounded-lg px-3 py-2 w-full"
				>
					Abbrechen
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex gap-2">
				<Button variant="secondary" onClick={() => setIsEditing(true)}>
					<PencilIcon className="size-4" aria-hidden="true" />
					Bearbeiten
				</Button>
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

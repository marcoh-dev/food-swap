"use client";

import { useState } from "react";
import { PencilIcon, Trash2Icon, ChevronDownIcon } from "lucide-react";
import ListingForm from "@/components/listing/ListingForm";
import {
  updateListingAction,
  deleteListingAction,
  updateListingStatusAction,
} from "@/app/actions";
import { statusActions } from "@/lib/constants/listing.constants";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  const statusItems = statusActions[listing.status] ?? [];

  async function handleUpdate(formData: FormData) {
    await updateListingAction(listing.id, formData);
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
        />
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="rounded-lg px-3 py-2 w-full"
        >
          Abbrechen
        </button>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Status ändern
              <ChevronDownIcon aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {listing.status === "pending" && (
              <DropdownMenuLabel>Ausstehend</DropdownMenuLabel>
            )}
            {statusItems.map((action) => (
              <DropdownMenuItem
                key={action.targetStatus}
                onClick={() => handleStatusChange(action.targetStatus)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={listing.status === "pending"}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2Icon aria-hidden="true" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {errorMessage && <p className="text-destructive">{errorMessage}</p>}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
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

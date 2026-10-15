"use client";

import { useState } from "react";
import ListingForm from "@/components/listing/ListingForm";
import { updateListingAction, deleteListingAction, updateListingStatusAction } from "@/app/actions";
import { statusActions } from "@/lib/constants/listing.constants";
import type { ListingResponse, ListingStatus } from "@/lib/types/listing.types";
import type { Category } from "@/lib/types/category.types";
import type { Tag } from "@/lib/types/tag.types";

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

  async function handleUpdate(formData: FormData) {
    await updateListingAction(listing.id, formData);
    setIsEditing(false);
  }

  function handleDelete() {
    if (!confirm("Wirklich löschen?")) return;
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
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="bg-gray-300 dark:bg-gray-600 rounded-lg px-3 py-2"
        >
          Bearbeiten
        </button>
        {listing.status !== "pending" && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-800 text-white rounded-lg px-3 py-2 disabled:opacity-50"
          >
            Löschen
          </button>
        )}
      </div>
      <div className="flex gap-3">
        {statusActions[listing.status]?.map((action) => (
          <button
            key={action.targetStatus}
            type="button"
            onClick={() => handleStatusChange(action.targetStatus)}
            className={`rounded-lg px-3 py-2  ${action.className}`}
          >
            {action.label}
          </button>
        ))}
      </div>
      {errorMessage && <p className="text-red-800">{errorMessage}</p>}
    </div>
  );
}

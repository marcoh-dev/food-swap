"use client";

import { useState } from "react";
import ListingForm from "@/components/listing/ListingForm";
import { updateListingAction, deleteListingAction } from "@/app/actions";
import { ListingResponse } from "@/lib/types/listing.types";

export default function ListingActions({
  listing,
}: {
  listing: ListingResponse;
}) {
  const [isEditing, setIsEditing] = useState(false);

  async function handleUpdate(formData: FormData) {
    await updateListingAction(listing.id, formData);
    setIsEditing(false);
  }

  function handleDelete() {
    if (!confirm("Wirklich löschen?")) return;
    deleteListingAction(listing.id);
  }

  if (isEditing) {
    return (
      <div>
        <ListingForm
          action={handleUpdate}
          defaultValues={listing}
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
    <div className="flex gap-3 mt-4">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="bg-gray-300 dark:bg-gray-600 rounded-lg px-3 py-2"
      >
        Bearbeiten
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="bg-red-800 text-white rounded-lg px-3 py-2 disabled:opacity-50"
      >
        Löschen
      </button>
    </div>
  );
}

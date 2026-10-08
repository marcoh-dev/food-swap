"use server";

import {
  createListing,
  deleteListing,
  updateListing,
} from "@/lib/listings.service";
import { NewListing } from "@/lib/types/listing.types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function readListing(formData: FormData): NewListing {
  return {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    location: formData.get("location") as string,
    type: formData.get("type") as string,
  };
}

export async function createListingAction(formData: FormData) {
  const listing = await createListing(readListing(formData));
  revalidatePath("/listings");
  redirect(`/listings/${listing.id}`);
}

export async function updateListingAction(id: string, formData: FormData) {
  await updateListing(id, readListing(formData));
  revalidatePath("/listings");
  revalidatePath(`/listings/${id}`);
}

export async function deleteListingAction(id: string) {
  await deleteListing(id);
  revalidatePath("/listings");
  redirect("/listings");
}

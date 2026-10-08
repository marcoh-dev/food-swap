"use server";

import { createListing } from "@/lib/listings.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createListingAction(formData: FormData) {
  const listing = await createListing({
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    location: formData.get("location") as string,
    type: formData.get("type") as string,
  });
  revalidatePath("/listings");
  redirect(`/listings/${listing.id}`);
}

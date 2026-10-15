import { createListingAction, isAuthenticated } from "@/app/actions";
import ListingForm from "@/components/listing/ListingForm";
import { getCategories } from "@/lib/categories.service";
import { redirect } from "next/navigation";

export default async function NewListingPage() {
  const isLoggedIn = await isAuthenticated();
  const categories = await getCategories();
  if (!isLoggedIn) {
    redirect("/login");
  }
  return (
    <>
      <ListingForm action={createListingAction} categories={categories} />
    </>
  );
}

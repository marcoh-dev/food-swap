import { createListingAction, isAuthenticated } from "@/app/actions";
import ListingForm from "@/components/listing/ListingForm";
import { getCategories } from "@/lib/categories.service";
import { getTags } from "@/lib/tags.service";
import { redirect } from "next/navigation";

export default async function NewListingPage() {
  const isLoggedIn = await isAuthenticated();
  const categories = await getCategories();
  const tags = await getTags();
  if (!isLoggedIn) {
    redirect("/login?redirect=/listings/new");
  }
  return (
    <>
      <ListingForm
        action={createListingAction}
        categories={categories}
        tags={tags}
      />
    </>
  );
}

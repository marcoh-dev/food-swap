import { createListingAction, isAuthenticated } from "@/app/actions";
import ListingForm from "@/components/ListingForm";
import { redirect } from "next/navigation";

export default async function NewListingPage() {
  const isLoggedIn = await isAuthenticated();
  if (!isLoggedIn) {
    redirect("/login");
  }
  return (
    <>
      <ListingForm action={createListingAction} />
    </>
  );
}

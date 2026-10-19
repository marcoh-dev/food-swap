import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users.service";

export default async function MyListingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?redirect=/me/listings");

  redirect(`/users/${currentUser.id}/listings`);
}

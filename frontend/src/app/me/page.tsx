import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users.service";

export default async function MePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?redirect=/me");

  redirect(`/users/${currentUser.id}`);
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users.service";
import type { Metadata } from "next";
import { pageTitles } from "@/lib/constants/titles.constants";

export const metadata: Metadata = { title: pageTitles.myListings };

export default async function MyListingsPage() {
	const currentUser = await getCurrentUser();
	if (!currentUser) redirect("/login?redirect=/me/listings");

	redirect(`/users/${currentUser.id}/listings`);
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/app/actions";
import CreateListingForm from "@/components/listing/CreateListingForm";
import { getCategories } from "@/lib/categories.service";
import { pageTitles } from "@/lib/constants/titles.constants";
import { getTags } from "@/lib/tags.service";
import { getCurrentUser } from "@/lib/users.service";

export const metadata: Metadata = { title: pageTitles.newListing };

export default async function NewListingPage() {
	const isLoggedIn = await isAuthenticated();
	if (!isLoggedIn) {
		redirect("/login?redirect=/listings/new");
	}

	const [categories, tags, currentUser] = await Promise.all([
		getCategories(),
		getTags(),
		getCurrentUser(),
	]);

	return (
		<>
			<h1>Erstelle ein neues Angebot</h1>
			<CreateListingForm
				categories={categories}
				tags={tags}
				defaultPlace={currentUser?.place}
			/>
		</>
	);
}

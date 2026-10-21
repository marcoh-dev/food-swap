import { isAuthenticated } from "@/app/actions";
import CreateListingForm from "@/components/listing/CreateListingForm";
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
	return <CreateListingForm categories={categories} tags={tags} />;
}

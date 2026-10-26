import { SortingMenu } from "@/components/listing/SortingMenu";
import { UserDelete } from "@/components/user/UserDelete";
import { UserUpdate } from "@/components/user/UserUpdate";
import { pageTitles } from "@/lib/constants/titles.constants";
import { getCurrentUser, getUserById } from "@/lib/users.service";
import { formatDate } from "@/utils/date";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import ListingImagePlaceholder from "@/components/listing/ListingImagePlaceholder";
import ExpiredBadge from "@/components/listing/ExpiredBadge";
import StatusBadge from "@/components/listing/StatusBadge";
import ListingMeta from "@/components/listing/ListingMeta";
import CategoryBadge from "@/components/listing/CategoryBadge";
import ListingsPagination from "@/components/listing/ListingsPagination";
import type { SortOption } from "@/lib/types/listing.types";
import { getUserListings } from "@/lib/listings.service";
import { parsePage } from "@/utils/pagination";
import ListingActions from "@/components/listing/ListingAction";
import { getCategories } from "@/lib/categories.service";
import { getTags } from "@/lib/tags.service";

export const metadata: Metadata = { title: pageTitles.myProfile };

export default async function UserPage({ params, searchParams }: PageProps<"/users/[id]">) {
	const { id: userId } = await params;
	const query = await searchParams;

	const user = await getUserById(userId);
	if (!user) notFound();

	const currentUser = await getCurrentUser();
	const isOwner = currentUser?.id === userId;

	const page = parsePage(query.page);
	const sort: SortOption = query.sort === "endingSoon" ? "endingSoon" : "newest";

	const categories = await getCategories();
	const tags = await getTags();

	const listingsData = await getUserListings({ userId, page, sort });

	if (!listingsData) {
		notFound();
	}

	const { totalPages } = listingsData.meta;
	if (totalPages > 0 && page > totalPages) {
		redirect(`/users/${userId}/listings?page=${totalPages}&sort=${sort}`);
	}

	return (
		<>
			<h2 className="text-h2">{user.name ?? user.username}</h2>
			<p>Benutzername: {user.username}</p>
			<p>Registriert seit: {formatDate(user.createdAt)}</p>
			{isOwner && (
				<>
					<UserUpdate
						currentName={user.name ?? undefined}
						currentPlace={currentUser.place}
					/>
					<UserDelete />
				</>
			)}

			{listingsData.data.length === 0 ? (
				<p className="py-12 text-center text-gray-500">
					Dieser User hat aktuell keine Anzeigen.
				</p>
			) : (
				<>
					<div className="flex w-full justify-end mb-2 mt-3">
						<SortingMenu sort={sort} />
					</div>
					<ul className="grid grid-cols-2 gap-3 sm:gap-8 md:gap-12">
						{listingsData.data.map((listing) => (
							<li key={listing.id}>
								<Card className="h-full overflow-hidden pt-0">
									<Link
										href={`/listings/${listing.id}`}
										className="block h-full no-underline"
									>
										<div className="relative aspect-[16/9] w-full overflow-hidden">
											{listing.image ? (
												<Image
													src={listing.image}
													alt={listing.title}
													width={250}
													height={200}
													className="h-full w-full object-cover"
												/>
											) : (
												<ListingImagePlaceholder />
											)}

											<div className="absolute top-2 left-2 flex flex-col items-start gap-1">
												{isOwner && <ExpiredBadge listing={listing} />}
												<StatusBadge listing={listing} />
											</div>
										</div>
										<CardHeader>
											<CardTitle className="text-h2">
												{listing.title}
											</CardTitle>
											<CardDescription>
												<ListingMeta
													listing={listing}
													dateVariant="relative"
													className="text-xs"
												/>
											</CardDescription>
											<CategoryBadge category={listing.category} />
										</CardHeader>
										<CardContent>
											<p className="text-xs">{listing.description}</p>
										</CardContent>
									</Link>
									{isOwner && (
										<CardFooter className="relative z-20 flex-col items-stretch">
											<ListingActions
												listing={listing}
												categories={categories}
												tags={tags}
											/>
										</CardFooter>
									)}
								</Card>
							</li>
						))}
					</ul>
					<ListingsPagination
						page={listingsData.meta.page}
						totalPages={totalPages}
						searchParams={{ sort }}
					/>
				</>
			)}
		</>
	);
}

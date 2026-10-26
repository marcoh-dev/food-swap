import CategoryBadge from "@/components/listing/CategoryBadge";
import ListingMeta from "@/components/listing/ListingMeta";
import StatusBadge from "@/components/listing/StatusBadge";
import SearchBar from "@/components/search/SearchBar";
import { SortingMenu } from "@/components/listing/SortingMenu";
import { getUserListings } from "@/lib/listings.service";
import type { SortOption } from "@/lib/types/listing.types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/users.service";
import type { Metadata } from "next";
import { pageTitles } from "@/lib/constants/titles.constants";
import ListingsPagination from "@/components/listing/ListingsPagination";
import { redirect } from "next/navigation";
import { parsePage } from "@/utils/pagination";
import ListingImagePlaceholder from "@/components/listing/ListingImagePlaceholder";
import ExpiredBadge from "@/components/listing/ExpiredBadge";

export const metadata: Metadata = { title: pageTitles.myListings };

export default async function UserListingsPage({
	params,
	searchParams,
}: PageProps<"/users/[id]/listings">) {
	const { id: userId } = await params;
	const query = await searchParams;

	const page = parsePage(query.page);
	const sort: SortOption = query.sort === "endingSoon" ? "endingSoon" : "newest";

	const currentUser = await getCurrentUser();
	const isOwner = currentUser?.id === userId;

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
			<SearchBar />
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
								<Link
									href={`/listings/${listing.id}`}
									className="block h-full no-underline"
								>
									<Card className="h-full overflow-hidden pt-0">
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
									</Card>
								</Link>
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

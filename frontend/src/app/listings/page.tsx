import { getListings } from "@/lib/listings.service";
import { getCategories } from "@/lib/categories.service";
import { getTags } from "@/lib/tags.service";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/search/SearchBar";
import { SortingMenu } from "@/components/SortingMenu";
import type { SortOption } from "@/lib/types/listing.types";
import CategoryBadge from "@/components/listing/CategoryBadge";
import StatusBadge from "@/components/listing/StatusBadge";
import TagList from "@/components/listing/TagList";
import ListingMeta from "@/components/listing/ListingMeta";
import ListingFilters from "@/components/listing/ListingFilter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import { pageTitles } from "@/lib/constants/titles.constants";

export const metadata: Metadata = { title: pageTitles.listings };

function getParam(value: string | string[] | undefined): string | undefined {
	if (typeof value === "string" && value !== "") {
		return value;
	}
	return undefined;
}

export default async function ListingsPage({ searchParams }: PageProps<"/listings">) {
	const params = await searchParams;
	const page = Number(params.page) || 1;
	const sort: SortOption = params.sort === "endingSoon" ? "endingSoon" : "newest";
	const term = getParam(params.term);
	const location = getParam(params.location);
	const category = getParam(params.category);
	const tags = getParam(params.tags);

	const [listingsData, categories, allTags] = await Promise.all([
		getListings({ page, sort, term, location, category, tags }),
		getCategories(),
		getTags(),
	]);

	const listings = listingsData?.data ?? [];
	const total = listingsData?.meta.total ?? 0;
	const isSearching = Boolean(term || location);
	const hasFilters = Boolean(category || tags);

	return (
		<>
			<SearchBar
				defaultTerm={term}
				defaultLocation={location}
				category={category}
				tags={tags}
			/>

			<div className="flex w-full items-start justify-between gap-4 mb-2">
				<ListingFilters categories={categories} tags={allTags} />
				<SortingMenu sort={sort} />
			</div>

			{isSearching && total > 0 && (
				<p className="mb-3">
					{total} {total === 1 ? "Ergebnis" : "Ergebnisse"}
					{term && ` für "${term}"`}
					{location && ` in "${location}"`}
				</p>
			)}

			{listings.length === 0 ? (
				<p className="py-12 text-center">
					{hasFilters
						? "Keine Angebote passen zu deinen Filtern."
						: "Keine Angebote gefunden. Versuche, deine Suche anzupassen."}
				</p>
			) : (
				<ul className="grid grid-cols-2 gap-3 sm:gap-8 md:gap-12">
					{listings.map((listing) => (
						<li key={listing.id}>
							<Link
								href={`/listings/${listing.id}`}
								className="block h-full no-underline"
							>
								<Card className="h-full overflow-hidden pt-0">
									<div className="relative aspect-[16/9] w-full overflow-hidden">
										<Image
											src={listing.image ?? "/placeholder.png"}
											alt={listing.title}
											width={250}
											height={200}
											className="h-full w-full object-cover"
										/>
										<div className="absolute top-2 left-2">
											<StatusBadge listing={listing} />
										</div>
									</div>
									<CardHeader>
										<CardTitle className="text-h2">{listing.title}</CardTitle>
										<CardDescription>
											<ListingMeta
												listing={listing}
												dateVariant="relative"
												className="text-xs"
											/>
										</CardDescription>
										<div className="flex flex-wrap items-center gap-1.5 justify-self-start">
											<CategoryBadge category={listing.category} />
											<TagList tags={listing.tags} max={2} />
										</div>
									</CardHeader>
									<CardContent>
										<p className="text-xs">{listing.description}</p>
									</CardContent>
								</Card>
							</Link>
						</li>
					))}
				</ul>
			)}
		</>
	);
}

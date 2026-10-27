import { getListings } from "@/lib/listings.service";
import { getCategories } from "@/lib/categories.service";
import { getTags } from "@/lib/tags.service";
import SearchBar from "@/components/search/SearchBar";
import { SortingMenu } from "@/components/listing/SortingMenu";
import type { SortOption } from "@/lib/types/listing.types";
import ListingFilters from "@/components/listing/ListingFilter";
import type { Metadata } from "next";
import { pageTitles } from "@/lib/constants/titles.constants";
import ListingsPagination from "@/components/listing/ListingsPagination";
import { parseRadius, SEARCH_FORM_ID } from "@/lib/constants/listing.constants";
import { SearchPlaceProvider } from "@/components/search/SearchPlaceContext";
import { getPlaceBySlug } from "@/lib/places.service";
import { formatPlace } from "@/utils/place";
import { redirect } from "next/navigation";
import { parsePage } from "@/utils/pagination";

import ListingCard from "@/components/listing/ListingCard";
import ViewMenu from "@/components/listing/ViewMenu";

export const metadata: Metadata = { title: pageTitles.listings };

function getParam(value: string | string[] | undefined): string | undefined {
	if (typeof value === "string" && value !== "") {
		return value;
	}
	return undefined;
}

export default async function ListingsPage({ searchParams }: PageProps<"/listings">) {
	const params = await searchParams;
	const page = parsePage(params.page);
	const term = getParam(params.term);
	const placeSlug = getParam(params.place);
	const selectedPlace = placeSlug ? await getPlaceBySlug(placeSlug) : null;
	const sort: SortOption =
		params.sort === "endingSoon"
			? "endingSoon"
			: params.sort === "nearest" && selectedPlace
				? "nearest"
				: "newest";

	const view = params.view === "list" ? "list" : "grid";
	const radius = selectedPlace ? parseRadius(getParam(params.radius)) : undefined;
	const category = getParam(params.category);
	const tags = getParam(params.tags);

	const [listingsData, categories, allTags] = await Promise.all([
		getListings({ page, sort, term, place: selectedPlace?.slug, radius, category, tags }),
		getCategories(),
		getTags(),
	]);

	const totalPages = listingsData?.meta.totalPages ?? 0;
	if (totalPages > 0 && page > totalPages) {
		const query = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (typeof value === "string") query.set(key, value);
		}
		query.set("page", String(totalPages));
		redirect(`/listings?${query.toString()}`);
	}

	const listings = listingsData?.data ?? [];
	const total = listingsData?.meta.total ?? 0;
	const isSearching = Boolean(term || selectedPlace);
	const hasFilters = Boolean(category || tags);

	return (
		<>
			<SearchPlaceProvider key={selectedPlace?.slug ?? ""} initialPlace={selectedPlace}>
				<SearchBar
					defaultTerm={term}
					defaultPlace={selectedPlace}
					defaultRadius={radius}
					category={category}
					tags={tags}
					sort={sort}
					view={view}
				/>

				<div className="flex w-full flex-col items-start mb-2">
					<ListingFilters categories={categories} tags={allTags} />
					<div className="self-end flex items-center gap-2">
						<ViewMenu view={view} />
						<SortingMenu sort={sort} searchFormId={SEARCH_FORM_ID} />
					</div>
				</div>
			</SearchPlaceProvider>

			{isSearching && total > 0 && (
				<p className="mb-3">
					{total} {total === 1 ? "Ergebnis" : "Ergebnisse"}
					{term && ` für "${term}"`}
					{selectedPlace && ` in "${formatPlace(selectedPlace)}"`}
					{radius && ` (+${radius}\u00a0km)`}
				</p>
			)}

			{listings.length === 0 ? (
				<p className="py-12 text-center">
					{hasFilters
						? "Keine Angebote passen zu deinen Filtern."
						: "Keine Angebote gefunden. Versuche, deine Suche anzupassen."}
				</p>
			) : (
				<>
					<ul
						className={
							view === "list"
								? "grid auto-rows-fr gap-3"
								: "grid grid-cols-2 gap-3 sm:gap-8 md:gap-12"
						}
					>
						{listings.map((listing) => (
							<li key={listing.id}>
								<ListingCard listing={listing} variant={view} />
							</li>
						))}
					</ul>
					<ListingsPagination
						page={listingsData?.meta.page ?? 1}
						totalPages={totalPages}
						searchParams={{
							term,
							place: selectedPlace?.slug,
							radius: radius ? String(radius) : undefined,
							category,
							tags,
							sort,
							view,
						}}
					/>
				</>
			)}
		</>
	);
}

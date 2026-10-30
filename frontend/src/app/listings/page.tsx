import type { Metadata } from "next";
import { redirect } from "next/navigation";

import ListingCard from "@/components/listing/ListingCard";
import ListingFilters from "@/components/listing/ListingFilter";
import ListingsPagination from "@/components/listing/ListingsPagination";
import { SortingMenu } from "@/components/listing/SortingMenu";
import ViewMenu from "@/components/listing/ViewMenu";
import SearchBar from "@/components/search/SearchBar";
import { SearchPlaceProvider } from "@/components/search/SearchPlaceContext";
import { Announcement } from "@/components/shared/Announcement";
import { getCategories } from "@/lib/categories.service";
import {
	LISTING_VIEW_CLASSES,
	parseRadius,
	SEARCH_FORM_ID,
} from "@/lib/constants/listing.constants";
import { pageTitles } from "@/lib/constants/titles.constants";
import { getListings } from "@/lib/listings.service";
import { getPlaceBySlug } from "@/lib/places.service";
import { getTags } from "@/lib/tags.service";
import type { SortOption } from "@/lib/types/listing.types";
import { parsePage } from "@/utils/pagination";
import { formatPlace } from "@/utils/place";

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

	const totalPages = listingsData.meta.totalPages;
	if (totalPages > 0 && page > totalPages) {
		const query = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (typeof value === "string") query.set(key, value);
		}
		query.set("page", String(totalPages));
		redirect(`/listings?${query.toString()}`);
	}

	const listings = listingsData.data;
	const total = listingsData.meta.total;
	const hasFilters = Boolean(category || tags);
	const resultsMessage =
		`${total} ${total === 1 ? "Angebot" : "Angebote"}` +
		(term ? ` für "${term}"` : "") +
		(selectedPlace ? ` in "${formatPlace(selectedPlace)}"` : "") +
		(radius ? ` (+${radius}\u00a0km)` : "");

	return (
		<>
			<h1 className="sr-only">Angebote</h1>
			<SearchPlaceProvider key={selectedPlace?.slug ?? ""} initialPlace={selectedPlace}>
				<div className="mb-6">
					<SearchBar
						defaultTerm={term}
						defaultPlace={selectedPlace}
						defaultRadius={radius}
						category={category}
						tags={tags}
						sort={sort}
						view={view}
					/>
				</div>
				<div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
					{total > 0 && <p>{resultsMessage}</p>}
					<div className="flex items-center justify-end gap-2 sm:ml-auto">
						<div className="mr-auto flex sm:mr-0">
							<ListingFilters
								categories={categories}
								tags={allTags}
								resultCount={total}
							/>
						</div>
						<ViewMenu view={view} />
						<SortingMenu sort={sort} searchFormId={SEARCH_FORM_ID} />
					</div>
				</div>
			</SearchPlaceProvider>

			<Announcement message={resultsMessage} />

			{listings.length === 0 ? (
				<p className="py-12 text-center">
					{hasFilters
						? "Keine Angebote passen zu deinen Filtern."
						: "Keine Angebote gefunden. Versuche, deine Suche anzupassen."}
				</p>
			) : (
				<>
					<ul className={LISTING_VIEW_CLASSES[view]}>
						{listings.map((listing) => (
							<li key={listing.id}>
								<ListingCard listing={listing} variant={view} from="listings" />
							</li>
						))}
					</ul>
					<ListingsPagination
						page={listingsData.meta.page}
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

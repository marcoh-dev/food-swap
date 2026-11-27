import type { ListingResponse, PaginatedListingsResponse } from "@food-swap/shared/types";
import {
	type InfiniteData,
	keepPreviousData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchListings, LISTINGS_LIST_QUERY_KEY, type ListingsQuery } from "@/api/listings";

type ListingsData = InfiniteData<PaginatedListingsResponse, number>;

// When a listing is added between loading two pages, the next page repeats the last listing of
// the previous one; it's only shown once
function uniqueById(pages: PaginatedListingsResponse[]): ListingResponse[] {
	const seen = new Set<string>();
	return pages
		.flatMap((page) => page.data)
		.filter((listing) => {
			if (seen.has(listing.id)) return false;
			seen.add(listing.id);
			return true;
		});
}

/**
 * The offers list in the given order, optionally filtered by a search term, loaded page by
 * page. `listings` are all loaded listings without duplicates; `reload` loads the first page
 * again (pull to refresh, try again).
 */
export function useListings(listingsQuery: ListingsQuery) {
	const queryClient = useQueryClient();
	const queryKey = [...LISTINGS_LIST_QUERY_KEY, listingsQuery];
	const query = useInfiniteQuery({
		queryKey,
		queryFn: ({ pageParam, signal }) => fetchListings(pageParam, listingsQuery, signal),
		initialPageParam: 1,
		placeholderData: keepPreviousData,
		getNextPageParam: (lastPage) =>
			lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
	});

	const listings = useMemo(() => (query.data ? uniqueById(query.data.pages) : []), [query.data]);

	async function reload() {
		// Refetching an infinite query reloads every loaded page one after another; starting over
		// with the first page is faster, and scrolling loads the rest again
		queryClient.setQueryData<ListingsData>(queryKey, (current) =>
			current
				? { pages: current.pages.slice(0, 1), pageParams: current.pageParams.slice(0, 1) }
				: current,
		);
		await query.refetch();
	}

	return {
		...query,
		listings,
		reload,
	};
}

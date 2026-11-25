import type { ListingResponse, PaginatedListingsResponse } from "@food-swap/shared/types";
import { type InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchListings, LISTINGS_QUERY_KEY } from "@/api/listings";

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
 * The offers list, loaded page by page. `listings` are all loaded listings without duplicates;
 * `reload` loads the first page again (pull to refresh, try again).
 */
export function useListings() {
	const queryClient = useQueryClient();
	const query = useInfiniteQuery({
		queryKey: LISTINGS_QUERY_KEY,
		queryFn: ({ signal, pageParam }) => fetchListings(pageParam, signal),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
	});

	const listings = useMemo(() => (query.data ? uniqueById(query.data.pages) : []), [query.data]);

	async function reload() {
		// Refetching an infinite query reloads every loaded page one after another; starting over
		// with the first page is faster, and scrolling loads the rest again
		queryClient.setQueryData<ListingsData>(LISTINGS_QUERY_KEY, (current) =>
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

import type { PaginatedListingsResponse } from "@food-swap/shared/types";
import { type InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { fetchListings, LISTINGS_QUERY_KEY } from "@/api/listings";

type ListingsData = InfiniteData<PaginatedListingsResponse, number>;

/** The offers list, loaded page by page; `reload` loads the first page again (pull to refresh, try again). */
export function useListings() {
	const queryClient = useQueryClient();
	const query = useInfiniteQuery({
		queryKey: LISTINGS_QUERY_KEY,
		queryFn: ({ signal, pageParam }) => fetchListings(pageParam, signal),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
	});

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
		reload,
	};
}

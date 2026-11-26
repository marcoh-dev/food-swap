import type { SortOption } from "@food-swap/shared/types";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import { fetchListings, LISTINGS_LIST_QUERY_KEY } from "@/api/listings";

export function useListings(sort: SortOption) {
	return useInfiniteQuery({
		queryKey: [...LISTINGS_LIST_QUERY_KEY, sort],
		queryFn: ({ pageParam, signal }) => fetchListings(pageParam, sort, signal),
		initialPageParam: 1,
		placeholderData: keepPreviousData,
		getNextPageParam: (lastPage) =>
			lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
	});
}

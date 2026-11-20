import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchListings, LISTINGS_QUERY_KEY } from "@/api/listings";

export function useListings() {
	return useInfiniteQuery({
		queryKey: LISTINGS_QUERY_KEY,
		queryFn: ({ signal, pageParam }) => fetchListings(pageParam, signal),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
	});
}

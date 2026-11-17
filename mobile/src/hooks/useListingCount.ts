import { useQuery } from "@tanstack/react-query";

import { fetchListingCount, LISTINGS_QUERY_KEY } from "@/api/listings";

export function useListingCount() {
	return useQuery({
		queryKey: [...LISTINGS_QUERY_KEY, "count"],
		queryFn: ({ signal }) => fetchListingCount(signal),
	});
}

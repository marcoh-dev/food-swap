import { useQuery } from "@tanstack/react-query";

import { fetchListings, LISTINGS_QUERY_KEY } from "@/api/listings";

export function useListings() {
	return useQuery({
		queryKey: LISTINGS_QUERY_KEY,
		queryFn: ({ signal }) => fetchListings(1, signal),
	});
}

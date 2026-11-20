import type { ListingResponse, PaginatedListingsResponse } from "@food-swap/shared/types";
import { type InfiniteData, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchListing, LISTINGS_QUERY_KEY } from "@/api/listings";

/**
 * One listing. While it loads, the listing from the offers list is shown, so the
 * detail screen opens right away; the server always answers with the current version.
 */
export function useListing(id: string, { enabled = true } = {}) {
	const queryClient = useQueryClient();

	return useQuery<ListingResponse>({
		queryKey: [...LISTINGS_QUERY_KEY, id],
		queryFn: ({ signal }) => fetchListing(id, signal),
		enabled,
		placeholderData: () =>
			queryClient
				.getQueryData<InfiniteData<PaginatedListingsResponse>>(LISTINGS_QUERY_KEY)
				?.pages.flatMap((page) => page.data)
				.find((listing) => listing.id === id),
	});
}

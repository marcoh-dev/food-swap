import type { ListingResponse, PaginatedListingsResponse } from "@food-swap/shared/types";

import { get } from "@/api/request";

export const LISTINGS_QUERY_KEY = ["listings"];

export function fetchListings(signal: AbortSignal) {
	return get<PaginatedListingsResponse>("/listings", signal);
}

export function fetchListing(id: string, signal: AbortSignal) {
	return get<ListingResponse>(`/listings/${id}`, signal);
}

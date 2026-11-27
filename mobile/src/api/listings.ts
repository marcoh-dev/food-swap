import type {
	ListingResponse,
	PaginatedListingsResponse,
	SortOption,
} from "@food-swap/shared/types";

import { get } from "@/api/request";

export const LISTINGS_QUERY_KEY = ["listings"];
export const LISTINGS_LIST_QUERY_KEY = [...LISTINGS_QUERY_KEY, "list"];

/** Everything the offers list is loaded by: its order and, optionally, a search term. */
export type ListingsQuery = { sort: SortOption; term?: string };

export function fetchListings(page: number, { sort, term }: ListingsQuery, signal: AbortSignal) {
	const params = new URLSearchParams({ sort, page: String(page) });
	if (term) params.set("term", term);
	return get<PaginatedListingsResponse>(`/listings?${params.toString()}`, signal);
}

export function fetchListing(id: string, signal: AbortSignal) {
	return get<ListingResponse>(`/listings/${id}`, signal);
}

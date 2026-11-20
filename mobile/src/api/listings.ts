import type { PaginatedListingsResponse } from "@food-swap/shared/types";

import { get } from "@/api/request";

export const LISTINGS_QUERY_KEY = ["listings"];

export function fetchListings(page: number, signal: AbortSignal) {
	return get<PaginatedListingsResponse>(`/listings?page=${page}`, signal);
}

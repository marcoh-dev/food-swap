import type { PaginatedListingsResponse } from "@food-swap/shared/types";

import { request } from "@/api/request";

export const LISTINGS_QUERY_KEY = ["listings"];

export function fetchListings(signal: AbortSignal) {
	return request<PaginatedListingsResponse>("/listings", signal);
}

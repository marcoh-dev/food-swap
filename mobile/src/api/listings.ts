import type { PaginatedListingsResponse } from "@food-swap/shared/types";

import { request } from "@/api/request";

export const LISTINGS_QUERY_KEY = ["listings"];

export function fetchListingCount(signal: AbortSignal) {
	return request<PaginatedListingsResponse>("/listings?limit=1", signal).then(
		({ meta }) => meta.total,
	);
}

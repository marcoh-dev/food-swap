import { request } from "@/api/request";

export const LISTINGS_QUERY_KEY = ["listings"];

type PaginatedListings = {
	meta: {
		total: number;
	};
};

export function fetchListingCount(signal: AbortSignal) {
	return request<PaginatedListings>("/listings?limit=1", signal).then(({ meta }) => meta.total);
}

import type { Place } from "@food-swap/shared/types";

import { get } from "@/api/request";

export const PLACES_QUERY_KEY = ["places"];

/** Places with a postal code whose name or postal code starts with `query`. */
export function searchPlaces(query: string, signal: AbortSignal) {
	const params = new URLSearchParams({ q: query, withPostalCode: "true" });
	return get<Place[]>(`/places?${params.toString()}`, signal);
}

import type { Place } from "./types/place.types";

// Place suggestions are cached without expiry. Bump this whenever the place data
// or the search in backend/src/places/places.service.ts changes.
const PLACES_CACHE_VERSION = "2";

export async function searchPlaces(query: string, withPostalCode = false): Promise<Place[]> {
	const params = new URLSearchParams({ q: query });
	if (withPostalCode) params.set("withPostalCode", "true");

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_FOODSWAP_API_URL}/places?${params.toString()}`,
		{
			cache: "force-cache",
			headers: { "X-Places-Cache-Version": PLACES_CACHE_VERSION },
		},
	);

	if (!response.ok) throw new Error(`Failed to search places: ${response.status}`);

	return response.json();
}

export async function getPlaceById(id: string): Promise<Place | null> {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_FOODSWAP_API_URL}/places/${encodeURIComponent(id)}`,
		{
			cache: "force-cache",
			headers: { "X-Places-Cache-Version": PLACES_CACHE_VERSION },
		},
	);

	if (!response.ok) return null;

	return response.json();
}

import type { Place } from "./types/place.types";

// Place suggestions are cached without expiry. Bump this whenever the place data
// or the search in backend/src/places/places.service.ts changes.
const PLACES_CACHE_VERSION = "1";

export async function searchPlaces(query: string): Promise<Place[]> {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_FOODSWAP_API_URL}/places?q=${encodeURIComponent(query)}`,
		{
			cache: "force-cache",
			headers: { "X-Places-Cache-Version": PLACES_CACHE_VERSION },
		},
	);

	if (!response.ok) throw new Error(`Failed to search places: ${response.status}`);

	return response.json();
}

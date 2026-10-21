import { fetchAPI } from "./fetchAPI";
import type { Place } from "./types/place.types";

export async function searchPlaces(query: string): Promise<Place[]> {
	const response = await fetchAPI(
		`${process.env.NEXT_PUBLIC_FOODSWAP_API_URL}/places?q=${encodeURIComponent(query)}`,
	);

	if (!response.ok) throw new Error(`Failed to search places: ${response.status}`);

	return response.json();
}

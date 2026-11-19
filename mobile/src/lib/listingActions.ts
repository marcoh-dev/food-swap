import type { ListingResponse } from "@food-swap/shared/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

export async function getListings(): Promise<ListingResponse[]> {
	const response = await fetch(`${API_URL}/listings`);

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}
	const json = await response.json();
	return json.data;
}

import type { Place } from "@/lib/types/place.types";

export function formatPlace(place: Pick<Place, "postalCode" | "name">) {
	return place.postalCode ? `${place.postalCode} ${place.name}` : place.name;
}

export function formatDistance(km: number) {
	return km < 1 ? "< 1\u00a0km entfernt" : `≈ ${Math.round(km)}\u00a0km entfernt`;
}

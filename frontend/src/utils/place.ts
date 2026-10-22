import type { Place } from "@/lib/types/place.types";

export function formatPlace(place: Pick<Place, "postalCode" | "name">) {
	return place.postalCode ? `${place.postalCode} ${place.name}` : place.name;
}

import type { Place } from "./types";

export function formatPlace(place: Pick<Place, "postalCode" | "name">) {
	return place.postalCode ? `${place.postalCode} ${place.name}` : place.name;
}

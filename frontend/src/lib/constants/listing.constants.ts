import type { ListingStatus, StatusAction } from "@/lib/types/listing.types";

export const statusActions: Partial<Record<ListingStatus, StatusAction[]>> = {
	active: [
		{
			label: "Reserviert",
			targetStatus: "reserved",
		},
		{
			label: "Deaktiviert",
			targetStatus: "deactivated",
		},
	],
	reserved: [
		{
			label: "Aktiviert",
			targetStatus: "active",
		},
		{
			label: "Deaktiviert",
			targetStatus: "deactivated",
		},
	],
	deactivated: [
		{
			label: "Aktiviert",
			targetStatus: "active",
		},
	],
};

export const statusLabels: Record<ListingStatus, string> = {
	pending: "Ausstehend",
	active: "Aktiviert",
	reserved: "Reserviert",
	deactivated: "Deaktiviert",
};

export const statusOrder: ListingStatus[] = ["pending", "active", "reserved", "deactivated"];

export const endDateRules = {
	defaultDays: 28,
	minDays: 1,
	maxMonths: 6,
	soonDays: 7,
	deleteAfterDays: 28,
} as const;

export const RADIUS_OPTIONS_KM = [5, 10, 20, 50];

export function parseRadius(value: string | undefined): number | undefined {
	const radius = Number(value);
	return RADIUS_OPTIONS_KM.includes(radius) ? radius : undefined;
}

export const MISSING_PLACE_MESSAGE = "Bitte wähle einen Ort aus der Liste aus.";

export const SEARCH_FORM_ID = "listing-search";

export const LISTING_VIEW_CLASSES: Record<"grid" | "list", string> = {
	grid: "grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4",
	list: "grid auto-rows-fr gap-3 max-sm:mx-[-1em] sm:gap-6 lg:grid-cols-2",
};

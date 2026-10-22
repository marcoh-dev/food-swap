import type { ListingStatus, StatusAction } from "../types/listing.types";

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

export const endDateRules = { defaultDays: 28, minDays: 1, maxMonths: 6, soonDays: 7 } as const;

export const RADIUS_OPTIONS_KM = [5, 10, 20, 50];

export function parseRadius(value: string | undefined): number | undefined {
	const radius = Number(value);
	return RADIUS_OPTIONS_KM.includes(radius) ? radius : undefined;
}

export const MISSING_PLACE_MESSAGE = "Bitte wähle einen Ort aus der Liste aus.";

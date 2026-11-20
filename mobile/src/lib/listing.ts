import type { ListingResponse, ListingStatus } from "@food-swap/shared/types";
import type { SymbolViewProps } from "expo-symbols";

type ListingType = ListingResponse["type"];

/** Labels of the listing types, e.g. for the type badge and screen readers. */
export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
	swap: "Tauschen",
	giveaway: "Verschenken",
};

/** Icons of the listing types: SF Symbols on iOS, Material Symbols on Android. */
export const LISTING_TYPE_ICONS: Record<ListingType, SymbolViewProps["name"]> = {
	swap: { ios: "repeat", android: "repeat" },
	giveaway: { ios: "gift", android: "redeem" },
};

/** Labels of the statuses shown as a badge on a listing; active listings get none. */
export const LISTING_STATUS_LABELS: Partial<Record<ListingStatus, string>> = {
	reserved: "Reserviert",
	deactivated: "Deaktiviert",
};

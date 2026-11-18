import type { ListingStatus, SortOption } from "@food-swap/shared/types";

export type ListingOrigin = "listings" | "profile";

export type StatusAction = {
	label: string;
	targetStatus: ListingStatus;
};

export type ParsedEndDate =
	{ status: "empty" } | { status: "invalid" } | { status: "valid"; date: Date };

export type EndDateResult = { ok: true; date: Date | undefined } | { ok: false; error: string };

export type GetListingsOptions = {
	page?: number;
	sort?: SortOption;
	term?: string;
	place?: string;
	radius?: number;
	category?: string;
	tags?: string;
};

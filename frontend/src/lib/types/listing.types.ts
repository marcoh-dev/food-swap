import type { Category } from "./category.types";
import type { Place } from "./place.types";
import type { PaginationMetaResponse } from "./common.types";
import type { Tag } from "./tag.types";
import type { User } from "./user.types";

export type ListingResponse = {
	id: string;
	title: string;
	description: string;
	image?: string;
	place: Place;
	type: ListingType;
	status: ListingStatus;
	owner: User;
	category: Category;
	tags: Tag[];
	createdAt: string;
	endDate: string;
	updatedAt: string;
};

export type NewListing = {
	title: string;
	description: string;
	image?: string;
	placeId: string;
	place?: Place;
	type: ListingType;
	categoryId?: string | null;
	tagIds?: string[];
	endDate?: string;
};

export type PaginatedListingsResponse = {
	data: ListingResponse[];
	meta: PaginationMetaResponse;
};

export type ListingType = "swap" | "giveaway";

export type SortOption = "newest" | "endingSoon";

export type ListingStatus = "pending" | "active" | "reserved" | "deactivated";

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

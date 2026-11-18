export type Place = {
	id: string;
	countryCode: string;
	postalCode: string | null;
	name: string;
	slug: string;
	city: string;
	county: string;
	state: string;
};

export type User = {
	id: string;
	username: string;
	name: string | null;
	createdAt: string;
	place?: Place | null;
};

export type Category = {
	id: string;
	slug: string;
	name: string;
};

export type Tag = {
	id: string;
	slug: string;
	name: string;
};

export type ListingType = "swap" | "giveaway";

export type ListingStatus = "pending" | "active" | "reserved" | "deactivated";

export type ListingResponse = {
	id: string;
	title: string;
	description: string;
	image?: string;
	place: Place;
	distance?: number;
	type: ListingType;
	status: ListingStatus;
	owner: User;
	category: Category;
	tags: Tag[];
	createdAt: string;
	endDate: string;
	updatedAt: string;
};

export type PaginationMetaResponse = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

export type PaginatedListingsResponse = {
	data: ListingResponse[];
	meta: PaginationMetaResponse;
};

export type PaginationMetaResponse = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

export type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string };

import type { Category } from "@food-swap/shared/types";

import { get } from "@/api/request";

export const CATEGORIES_QUERY_KEY = ["categories"];

export function fetchCategories(signal: AbortSignal) {
	return get<Category[]>("/categories", signal);
}

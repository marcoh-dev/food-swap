import type { Tag } from "@food-swap/shared/types";

import { get } from "@/api/request";

export const TAGS_QUERY_KEY = ["tags"];

export function fetchTags(signal: AbortSignal) {
	return get<Tag[]>("/tags", signal);
}

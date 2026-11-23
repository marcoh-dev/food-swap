import type { User } from "@food-swap/shared/types";

import { get } from "@/api/request";

export const USERS_QUERY_KEY = ["users"];

export function fetchUser(id: string, signal: AbortSignal) {
	return get<User>(`/users/${id}`, signal);
}

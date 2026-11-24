import type { User } from "@food-swap/shared/types";

import { get, patchWithoutResponse } from "@/api/request";

export const USERS_QUERY_KEY = ["users"];

export type ProfileUpdate = { name: string; placeId: string | null };

export function fetchUser(id: string, signal: AbortSignal) {
	return get<User>(`/users/${id}`, signal);
}

export function updateUser(id: string, values: ProfileUpdate) {
	return patchWithoutResponse(`/users/${id}`, values);
}

import type { AuthResponse, CurrentUser } from "@food-swap/shared/types";

import { post, request } from "@/api/request";
import type { LoginValues } from "@/lib/schemas/user.schemas";

export const CURRENT_USER_QUERY_KEY = ["auth", "me"];

export function login(values: LoginValues) {
	return post<AuthResponse>("/auth/login", values);
}

export function fetchCurrentUser(signal: AbortSignal) {
	return request<CurrentUser>("/auth/me", signal);
}

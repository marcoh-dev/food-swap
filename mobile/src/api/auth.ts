import type { LoginValues } from "@food-swap/shared/schemas/user";
import type { AuthResponse, CurrentUser } from "@food-swap/shared/types";

import { post, request } from "@/api/request";

export const CURRENT_USER_QUERY_KEY = ["auth", "me"];

export function login(values: LoginValues) {
	return post<AuthResponse>("/auth/login", values);
}

export function fetchCurrentUser(signal: AbortSignal) {
	return request<CurrentUser>("/auth/me", signal);
}

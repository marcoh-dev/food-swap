import type { LoginValues, RegistrationValues } from "@food-swap/shared/schemas/user";
import type { AuthResponse, CurrentUser } from "@food-swap/shared/types";

import { get, post, postWithoutResponse } from "@/api/request";

export const CURRENT_USER_QUERY_KEY = ["auth", "me"];

export function login(values: LoginValues) {
	return post<AuthResponse>("/auth/login", values);
}

/** Creates the account and logs in right away: the answer has the tokens like a login. */
export function register(values: RegistrationValues) {
	return post<AuthResponse>("/auth/register", values);
}

export function logout(refreshToken: string) {
	return postWithoutResponse("/auth/logout", { refresh_token: refreshToken });
}

export function logoutEverywhere() {
	return postWithoutResponse("/auth/logout-all", {});
}

export function fetchCurrentUser(signal: AbortSignal) {
	return get<CurrentUser>("/auth/me", signal);
}

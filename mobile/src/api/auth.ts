import { post, request } from "@/api/request";
import type { LoginValues } from "@/lib/schemas/user.schemas";

type LoginResponse = { access_token: string };

export type CurrentUser = {
	id: string;
	username: string;
	name: string | null;
};

export const CURRENT_USER_QUERY_KEY = ["auth", "me"];

export function login(values: LoginValues) {
	return post<LoginResponse>("/auth/login", values);
}

export function fetchCurrentUser(signal: AbortSignal) {
	return request<CurrentUser>("/auth/me", signal);
}

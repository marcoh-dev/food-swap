import type { AuthResponse, RegistrationResponse, UserCredentials } from "@food-swap/shared/types";

import { clientIpHeaders } from "./clientIp";
import { fetchAPI } from "./fetchAPI";

export async function loginUser({ username, password }: UserCredentials): Promise<AuthResponse> {
	const response = await fetchAPI(process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, password }),
	});
	const authData = await response.json();

	return authData;
}

export async function registerUser({
	username,
	password,
}: UserCredentials): Promise<RegistrationResponse> {
	const response = await fetchAPI(process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/auth/register`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, password }),
	});
	const registrationData = await response.json();

	return registrationData;
}

/**
 * Exchanges a refresh token for new tokens. Returns `null` if the backend rejects the
 * refresh token and throws if the backend can't be reached. Called from `proxy.ts`, which
 * passes the browser's request headers (`fetchAPI` can't read them there).
 */
export async function renewTokens(
	refreshToken: string,
	requestHeaders: Headers,
): Promise<AuthResponse | null> {
	const response = await fetch(process.env.NEXT_PUBLIC_FOODSWAP_API_URL + "/auth/refresh", {
		method: "POST",
		headers: { "Content-Type": "application/json", ...clientIpHeaders(requestHeaders) },
		body: JSON.stringify({ refresh_token: refreshToken }),
	});

	if (response.status === 401) return null;
	if (!response.ok) throw new Error(`Token refresh failed with status ${response.status}`);

	return response.json();
}

/** Makes the refresh token unusable in the backend; errors are ignored, since it expires anyway. */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
	await fetchAPI(process.env.NEXT_PUBLIC_FOODSWAP_API_URL + "/auth/logout", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refresh_token: refreshToken }),
	}).catch(() => undefined);
}

export async function logoutEverywhere(): Promise<void> {
	const response = await fetchAPI(process.env.NEXT_PUBLIC_FOODSWAP_API_URL + "/auth/logout-all", {
		method: "POST",
	});
	if (!response.ok) throw new Error(`Logout everywhere failed with status ${response.status}`);
}

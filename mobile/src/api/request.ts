import { type AuthTokens, getRefreshToken, getToken, saveTokens } from "@/api/token";
import { getEnv } from "@/env";

class RequestError extends Error {
	status: number;

	constructor(status: number) {
		super(`Request failed with status ${status}`);
		this.status = status;
	}
}

export function isNotFoundError(error: unknown) {
	return error instanceof RequestError && error.status === 404;
}

export function isUnauthorizedError(error: unknown) {
	return error instanceof RequestError && error.status === 401;
}

let renewing: Promise<boolean> | null = null;

// Several requests can fail with 401 at the same time; they share one renewal, because each
// renewal replaces the refresh token. Returns false if the refresh token is missing or rejected.
function renewTokens() {
	renewing ??= (async () => {
		const refreshToken = await getRefreshToken();
		if (!refreshToken) return false;

		const response = await fetch(`${getEnv().EXPO_PUBLIC_API_URL}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh_token: refreshToken }),
		});

		if (response.status === 401) return false;
		if (!response.ok) throw new RequestError(response.status);

		await saveTokens((await response.json()) as AuthTokens);
		return true;
	})().finally(() => {
		renewing = null;
	});

	return renewing;
}

async function fetchWithToken(path: string, init?: RequestInit) {
	const headers = new Headers(init?.headers);
	const token = await getToken();
	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const response = await fetch(`${getEnv().EXPO_PUBLIC_API_URL}${path}`, { ...init, headers });
	return { response, sentToken: token !== null };
}

async function send(path: string, init?: RequestInit) {
	let { response, sentToken } = await fetchWithToken(path, init);

	// The access token expired: renew it once and repeat the request
	if (response.status === 401 && sentToken && (await renewTokens())) {
		({ response } = await fetchWithToken(path, init));
	}

	if (!response.ok) {
		throw new RequestError(response.status);
	}

	return response;
}

export async function get<TData>(path: string, signal: AbortSignal): Promise<TData> {
	const response = await send(path, { method: "GET", signal });

	return response.json();
}

export async function post<TData>(path: string, body: unknown): Promise<TData> {
	const response = await send(path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	return response.json();
}

export async function postWithoutResponse(path: string, body: unknown): Promise<void> {
	await send(path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

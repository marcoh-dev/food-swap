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

async function send(path: string, init?: RequestInit) {
	const response = await fetch(`${getEnv().EXPO_PUBLIC_API_URL}${path}`, init);

	if (!response.ok) {
		throw new RequestError(response.status);
	}

	return response;
}

export async function request<TData>(path: string, signal: AbortSignal): Promise<TData> {
	const response = await send(path, { signal });

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

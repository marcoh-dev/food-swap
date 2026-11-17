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

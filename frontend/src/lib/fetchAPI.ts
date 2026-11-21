import { cookies } from "next/headers";

import { AUTH_COOKIE } from "@/lib/authCookies";

export async function fetchAPI(path: string, options: RequestInit = {}) {
	const cookieStore = await cookies();
	const token = cookieStore.get(AUTH_COOKIE)?.value;

	const headers = new Headers(options.headers);

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	return fetch(`${path}`, {
		...options,
		headers,
	});
}

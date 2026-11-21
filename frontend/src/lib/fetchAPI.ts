import { cookies, headers as requestHeaders } from "next/headers";

import { AUTH_COOKIE } from "@/lib/authCookies";
import { clientIpHeaders } from "@/lib/clientIp";

export async function fetchAPI(path: string, options: RequestInit = {}) {
	const cookieStore = await cookies();
	const token = cookieStore.get(AUTH_COOKIE)?.value;

	const headers = new Headers(options.headers);
	for (const [name, value] of Object.entries(clientIpHeaders(await requestHeaders()))) {
		headers.set(name, value);
	}

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	return fetch(`${path}`, {
		...options,
		headers,
	});
}

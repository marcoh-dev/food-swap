import { type NextRequest, NextResponse } from "next/server";

import { renewTokens } from "@/lib/auth.service";
import { AUTH_COOKIE, REFRESH_COOKIE, setAuthCookies } from "@/lib/authCookies";

/**
 * Renews the login before a request when the access token cookie has expired and a refresh
 * token exists, so users stay logged in without noticing.
 */
export async function proxy(request: NextRequest) {
	const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
	if (request.cookies.has(AUTH_COOKIE) || !refreshToken) return NextResponse.next();

	let tokens;
	try {
		tokens = await renewTokens(refreshToken);
	} catch {
		// Backend not reachable: this request runs logged out, the refresh token may work next time
		return NextResponse.next();
	}

	if (!tokens) {
		const response = NextResponse.next();
		response.cookies.delete(REFRESH_COOKIE);
		return response;
	}

	// Pages and server actions of this request read the cookie header, so it gets the new tokens too
	request.cookies.set(AUTH_COOKIE, tokens.access_token);
	request.cookies.set(REFRESH_COOKIE, tokens.refresh_token);

	const response = NextResponse.next({ request: { headers: request.headers } });
	setAuthCookies(response.cookies, tokens);
	return response;
}

export const config = {
	// Not for static files and images
	matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};

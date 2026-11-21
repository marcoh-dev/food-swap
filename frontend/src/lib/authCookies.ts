import type { AuthResponse } from "@food-swap/shared/types";

/** Cookie with the access token that pages and server actions send to the backend. */
export const AUTH_COOKIE = "auth_token";

/** Cookie with the refresh token; `proxy.ts` uses it to get a new access token. */
export const REFRESH_COOKIE = "refresh_token";

// The access token lives 15 minutes (backend). Its cookie ends a minute earlier, so the proxy renews it
// before the backend could reject it during a request.
const ACCESS_COOKIE_SECONDS = 14 * 60;
const REFRESH_COOKIE_SECONDS = 30 * 24 * 60 * 60;

type AuthTokens = Pick<AuthResponse, "access_token" | "refresh_token">;

type CookieOptions = {
	httpOnly: boolean;
	secure: boolean;
	sameSite: "lax";
	path: string;
	maxAge: number;
};

// Works with `cookies()` in server actions and with the response cookies in `proxy.ts`
type CookieStore = {
	set: (name: string, value: string, options: CookieOptions) => unknown;
	delete: (name: string) => unknown;
};

function options(maxAge: number): CookieOptions {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge,
	};
}

export function setAuthCookies(cookieStore: CookieStore, tokens: AuthTokens) {
	cookieStore.set(AUTH_COOKIE, tokens.access_token, options(ACCESS_COOKIE_SECONDS));
	cookieStore.set(REFRESH_COOKIE, tokens.refresh_token, options(REFRESH_COOKIE_SECONDS));
}

export function deleteAuthCookies(cookieStore: CookieStore) {
	cookieStore.delete(AUTH_COOKIE);
	cookieStore.delete(REFRESH_COOKIE);
}

/**
 * Headers that tell the backend which user a request is for, so its rate limits count per user IP
 * and not per Vercel server. Only sent together with the shared secret, which the backend checks.
 * Cached fetches (tags, categories, place search) don't send them, since they rarely reach the
 * backend and per-user headers would break the cache.
 */
export function clientIpHeaders(requestHeaders: Headers): Record<string, string> {
	const secret = process.env.INTERNAL_API_SECRET;
	// Vercel sets both itself, so the browser can't fake them
	const ip =
		requestHeaders.get("x-real-ip") ??
		requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();

	return secret && ip ? { "X-Client-IP": ip, "X-Internal-Secret": secret } : {};
}

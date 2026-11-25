/**
 * A `?redirect=` target that is safe to send the user to: a path on this site, otherwise "/".
 * Rejects other sites like `//example.com` or `/\example.com`.
 */
export function getRedirectTarget(target: unknown): string {
	if (
		typeof target !== "string" ||
		!target.startsWith("/") ||
		target.startsWith("//") ||
		target.startsWith("/\\")
	) {
		return "/";
	}

	return target;
}

/**
 * How long a login lasts without being used: a refresh token expires after this many days. The
 * push cleanup uses the same value, so a device whose login expired gets no more pushes. The web
 * keeps the refresh cookie for the same time (frontend/src/lib/authCookies.ts).
 */
export const REFRESH_TOKEN_DAYS = 30;

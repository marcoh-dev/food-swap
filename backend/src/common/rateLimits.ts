const MINUTE = 60 * 1000;

/** Requests per IP for everything without its own limit; only scripts get close to it. */
export const GENERAL_LIMIT = { limit: 300, ttl: MINUTE };

/** Login attempts per IP; a bit more than needed, because mobile carriers share IPs. */
export const LOGIN_LIMIT = { limit: 20, ttl: 15 * MINUTE };

/** Registrations per IP. */
export const REGISTRATION_LIMIT = { limit: 10, ttl: 60 * MINUTE };

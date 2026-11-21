import type { INestApplication } from "@nestjs/common";
import { ThrottlerStorage, type ThrottlerStorageService } from "@nestjs/throttler";

/** Clears the rate limit counters, so tests that register many users don't hit the limits. */
export function resetRateLimits(app: INestApplication) {
	// The storage has no reset method; its shutdown hook empties all counters and is safe to call
	app.get<ThrottlerStorageService>(ThrottlerStorage).onApplicationShutdown();
}

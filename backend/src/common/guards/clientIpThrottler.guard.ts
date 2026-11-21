import { ExecutionContext, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ThrottlerGuard, type ThrottlerLimitDetail } from "@nestjs/throttler";
import type { Request } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";

import { rateLimitAddress } from "../utils/rate-limit-address";

function sameSecret(sent: string, secret: string) {
	const a = Buffer.from(sent);
	const b = Buffer.from(secret);
	return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Rate limits per client IP. Website requests reach the backend from the Next.js server, which
 * forwards the user's IP in `X-Client-IP` together with the shared secret.
 */
@Injectable()
export class ClientIpThrottlerGuard extends ThrottlerGuard {
	@Inject(ConfigService)
	private readonly configService!: ConfigService;

	private secret = "";
	private readonly blockLogger = new Logger("RateLimit");
	// Until when a blocked source was logged, so an attack doesn't flood the logs
	private readonly loggedUntil = new Map<string, number>();

	override async onModuleInit() {
		this.secret = this.configService.getOrThrow<string>("INTERNAL_API_SECRET");
		await super.onModuleInit();
	}

	protected override getTracker(req: Request): Promise<string> {
		const clientIp = req.headers["x-client-ip"];
		const sentSecret = req.headers["x-internal-secret"];

		// Without the secret anyone could send a different fake IP with each request
		const fromOurServer =
			typeof clientIp === "string" &&
			typeof sentSecret === "string" &&
			sameSecret(sentSecret, this.secret);

		return Promise.resolve(rateLimitAddress(fromOurServer ? clientIp : (req.ip ?? "")));
	}

	/**
	 * Logs the first blocked request of a source per time window, so blocks show up in the Render
	 * logs. Only the start of the HMAC key identifies the source, never the IP.
	 */
	protected override async throwThrottlingException(
		context: ExecutionContext,
		detail: ThrottlerLimitDetail,
	): Promise<void> {
		const now = Date.now();
		if ((this.loggedUntil.get(detail.key) ?? 0) < now) {
			for (const [key, until] of this.loggedUntil) {
				if (until < now) this.loggedUntil.delete(key);
			}
			this.loggedUntil.set(detail.key, now + detail.ttl);

			const { method, path } = context.switchToHttp().getRequest<Request>();
			this.blockLogger.warn(
				`Blocked ${method} ${path}: more than ${detail.limit} requests in ${detail.ttl / 60_000} min (source ${detail.key.slice(0, 8)})`,
			);
		}

		await super.throwThrottlingException(context, detail);
	}

	// The package hashes the key with plain SHA-256, which can be traced back to an IP by trying
	// all addresses; with the secret (HMAC) it can't
	protected override generateKey(context: ExecutionContext, tracker: string, name: string) {
		const prefix = `${context.getClass().name}-${context.getHandler().name}-${name}`;
		return createHmac("sha256", this.secret).update(`${prefix}-${tracker}`).digest("hex");
	}
}

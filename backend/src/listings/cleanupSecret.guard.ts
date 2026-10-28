import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, timingSafeEqual } from "crypto";
import type { Request } from "express";

const sha256 = (value: string) => createHash("sha256").update(value).digest();

@Injectable()
export class CleanupSecretGuard implements CanActivate {
	constructor(private readonly configService: ConfigService) {}

	canActivate(context: ExecutionContext): boolean {
		const secret = this.configService.get<string>("CLEANUP_SECRET");
		const request = context.switchToHttp().getRequest<Request>();
		const token = request.headers.authorization?.replace(/^Bearer /, "");

		if (!secret || !token || !timingSafeEqual(sha256(token), sha256(secret))) {
			throw new UnauthorizedException();
		}

		return true;
	}
}

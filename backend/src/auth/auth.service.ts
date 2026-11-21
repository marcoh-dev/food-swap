import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "node:crypto";
import { LessThan, MoreThan, Repository } from "typeorm";

import { RefreshToken } from "./entities/refreshToken.entity";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";

const REFRESH_TOKEN_DAYS = 30;
const USED_REFRESH_TOKEN_SECONDS = 60;

function hashToken(token: string) {
	return createHash("sha256").update(token).digest("hex");
}

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		@InjectRepository(RefreshToken)
		private readonly refreshTokens: Repository<RefreshToken>,
	) {}

	async validateUser(username: string, password: string) {
		const user = await this.usersService.findByUsername(username);
		if (user && (await bcrypt.compare(password, user.passwordHash))) {
			const { passwordHash: _, ...safeUser } = user;
			return safeUser;
		}
		return null;
	}

	async login(user: Pick<User, "id">) {
		return {
			access_token: this.jwtService.sign({ sub: user.id }),
			refresh_token: await this.createRefreshToken(user.id),
		};
	}

	/** Exchanges a refresh token for a new token pair; the old refresh token stops working a minute later. */
	async refresh(refreshToken: string) {
		const tokenHash = hashToken(refreshToken);
		const stored = await this.refreshTokens.findOneBy({
			tokenHash,
			expiresAt: MoreThan(new Date()),
		});

		if (!stored) {
			throw new UnauthorizedException("Invalid or expired refresh token");
		}

		// Several requests can send the same token at once (e.g. a page and its prefetches after the
		// access token expired), so a used token keeps working for a minute instead of logging out
		const usableUntil = new Date(Date.now() + USED_REFRESH_TOKEN_SECONDS * 1000);
		await this.refreshTokens.update(
			{ tokenHash, expiresAt: MoreThan(usableUntil) },
			{ expiresAt: usableUntil },
		);

		return this.login({ id: stored.userId });
	}

	/** Makes the refresh token unusable; unknown tokens are ignored. */
	async logout(refreshToken: string) {
		await this.refreshTokens.delete({ tokenHash: hashToken(refreshToken) });
	}

	private async createRefreshToken(userId: string) {
		// Random, not a JWT: it's only ever compared with the stored hash
		const token = randomBytes(32).toString("base64url");

		// Expired tokens of this user are no longer useful, so they don't pile up
		await this.refreshTokens.delete({ userId, expiresAt: LessThan(new Date()) });
		await this.refreshTokens.insert({
			userId,
			tokenHash: hashToken(token),
			expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
		});

		return token;
	}
}

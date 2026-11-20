import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "node:crypto";
import { LessThan, Repository } from "typeorm";

import { RefreshToken } from "./entities/refreshToken.entity";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";

const REFRESH_TOKEN_DAYS = 30;

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

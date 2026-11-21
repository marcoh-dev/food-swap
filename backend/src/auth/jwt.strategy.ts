import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import type { Payload } from "./login.types";
import { UsersService } from "../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private readonly usersService: UsersService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
		});
	}

	async validate(payload: Payload) {
		// Socket tickets are signed with the same secret but are only for the chat connection
		if (payload.purpose) {
			throw new UnauthorizedException("Not an access token");
		}

		const user = await this.usersService.findById(payload.sub);

		if (!user) {
			throw new UnauthorizedException("User no longer exists");
		}

		// JWT times are in seconds, so tokens from the same second as the logout still pass
		const loggedOutAt = user.loggedOutEverywhereAt?.getTime();
		if (loggedOutAt && (payload.iat ?? 0) < Math.floor(loggedOutAt / 1000)) {
			throw new UnauthorizedException("Logged out everywhere");
		}

		return {
			id: user.id,
			username: user.username,
			name: user.name,
		};
	}
}

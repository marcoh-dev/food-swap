import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";

import { AuthService } from "./auth.service";
import { User } from "../users/entities/user.entity";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super();
	}

	async validate(username: string, password: string): Promise<Omit<User, "passwordHash">> {
		const user = await this.authService.validateUser(username, password);
		if (!user) {
			throw new UnauthorizedException("Invalid credentials");
		}
		return user;
	}
}

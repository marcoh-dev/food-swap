import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RefreshToken } from "./entities/refreshToken.entity";
import { JwtStrategy } from "./jwt.strategy";
import { LocalStrategy } from "./local.strategy";
import { UsersModule } from "../users/users.module";

@Module({
	imports: [
		UsersModule,
		PassportModule,
		TypeOrmModule.forFeature([RefreshToken]),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.getOrThrow<string>("JWT_SECRET"),
				signOptions: {
					// Short, because access tokens can't be revoked; the apps renew them with the refresh token
					expiresIn: "15m",
				},
			}),
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	exports: [JwtModule],
})
export class AuthModule {}

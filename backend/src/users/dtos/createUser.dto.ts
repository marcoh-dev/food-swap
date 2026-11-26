import { Transform } from "class-transformer";
import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

import { trimString } from "../../common/utils/trim-string";

/** Copy of USERNAME_PATTERN in shared/src/schemas/user.schemas.ts; createUser.dto.spec.ts compares them. */
export const USERNAME_PATTERN = /^[A-Za-z0-9äöüÄÖÜß_.-]+$/;

export class CreateUserDto {
	@IsString()
	@MinLength(5)
	@MaxLength(20)
	@Transform(trimString)
	@Matches(USERNAME_PATTERN, {
		message: "Username may only contain letters, digits, _ . and -",
	})
	username!: string;

	@IsString()
	@MinLength(8)
	@MaxLength(64)
	@Transform(trimString)
	@Matches(/[A-Z]/, {
		message: "Password must contain at least one uppercase letter",
	})
	@Matches(/[a-z]/, {
		message: "Password must contain at least one lowercase letter",
	})
	@Matches(/[0-9]/, {
		message: "Password must contain at least one number",
	})
	@Matches(/[^A-Za-z0-9]/, {
		message: "Password must contain at least one special character",
	})
	password!: string;

	// PROFILE_NAME_MAX_LENGTH in shared/src/schemas/user.schemas.ts
	@IsOptional()
	@IsString()
	@MaxLength(40)
	@Transform(trimString)
	name?: string | null;
}

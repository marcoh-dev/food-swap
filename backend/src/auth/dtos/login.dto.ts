import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

import { trimString } from "../../common/utils/trim-string";

export class LoginDto {
	@IsString()
	@IsNotEmpty()
	@Transform(trimString)
	username!: string;

	@IsString()
	@IsNotEmpty()
	@Transform(trimString)
	password!: string;
}

import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { UpdateUserDto } from "./updateUser.dto";

describe("UpdateUserDto", () => {
	// The profile name is optional: without one, the apps show the username (`name ?? username`)
	it("saves an empty profile name as null", async () => {
		const dto = plainToInstance(UpdateUserDto, { name: "   " });

		expect(dto.name).toBeNull();
		expect(await validate(dto)).toHaveLength(0);
	});

	it("trims a profile name", () => {
		expect(plainToInstance(UpdateUserDto, { name: "  Tomate " }).name).toBe("Tomate");
	});
});

import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { CreateUserDto, USERNAME_PATTERN } from "./createUser.dto";

const usernameErrors = async (username: string) => {
	const dto = plainToInstance(CreateUserDto, { username, password: "Tomate123!" });
	const errors = await validate(dto);
	return errors.filter((error) => error.property === "username");
};

describe("CreateUserDto", () => {
	it("uses the same username pattern as shared", () => {
		// Read as text: the backend's TypeScript setup can't import files outside the backend
		const source = readFileSync(
			join(__dirname, "../../../../shared/src/schemas/user.schemas.ts"),
			"utf8",
		);
		const shared = /USERNAME_PATTERN = (\/.+\/);/.exec(source)?.[1];

		expect(shared).toBe(String(USERNAME_PATTERN));
	});

	it("allows letters with umlauts, digits, _ . and -", async () => {
		expect(await usernameErrors("Jürgen_K.-92")).toHaveLength(0);
	});

	it("rejects spaces and letters from other scripts", async () => {
		expect(await usernameErrors("Anna Maria")).toHaveLength(1);
		expect(await usernameErrors("Аdmin")).toHaveLength(1);
	});
});

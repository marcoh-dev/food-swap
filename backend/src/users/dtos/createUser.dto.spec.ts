import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { CreateUserDto, USERNAME_PATTERN } from "./createUser.dto";

// Read as text: the backend's TypeScript setup can't import files outside the backend
const sharedSchemas = readFileSync(
	join(__dirname, "../../../../shared/src/schemas/user.schemas.ts"),
	"utf8",
);

/** A number constant from shared/src/schemas/user.schemas.ts, e.g. USERNAME_MAX_LENGTH. */
const sharedLimit = (name: string) =>
	Number(new RegExp(`${name} = (\\d+);`).exec(sharedSchemas)?.[1]);

const errorsFor = async (property: string, values: Record<string, unknown>) => {
	const dto = plainToInstance(CreateUserDto, {
		username: "tomate",
		password: "Tomate123!",
		...values,
	});
	const errors = await validate(dto);
	return errors.filter((error) => error.property === property);
};

const usernameErrors = (username: string) => errorsFor("username", { username });
// Upper and lower case, a digit and a special character, filled up to the length
const passwordErrors = (length: number) =>
	errorsFor("password", { password: "Aa1!".padEnd(length, "a") });
const nameErrors = (name: string) => errorsFor("name", { name });

describe("CreateUserDto", () => {
	it("uses the same username pattern as shared", () => {
		const shared = /USERNAME_PATTERN = (\/.+\/);/.exec(sharedSchemas)?.[1];

		expect(shared).toBe(String(USERNAME_PATTERN));
	});

	it("uses the same length limits as shared", async () => {
		const usernameMin = sharedLimit("USERNAME_MIN_LENGTH");
		const usernameMax = sharedLimit("USERNAME_MAX_LENGTH");
		const passwordMin = sharedLimit("PASSWORD_MIN_LENGTH");
		const passwordMax = sharedLimit("PASSWORD_MAX_LENGTH");
		const nameMax = sharedLimit("PROFILE_NAME_MAX_LENGTH");
		// A renamed constant would be NaN
		expect([usernameMin, usernameMax, passwordMin, passwordMax, nameMax]).not.toContain(NaN);

		expect(await usernameErrors("a".repeat(usernameMin))).toHaveLength(0);
		expect(await usernameErrors("a".repeat(usernameMin - 1))).toHaveLength(1);
		expect(await usernameErrors("a".repeat(usernameMax))).toHaveLength(0);
		expect(await usernameErrors("a".repeat(usernameMax + 1))).toHaveLength(1);
		expect(await passwordErrors(passwordMin)).toHaveLength(0);
		expect(await passwordErrors(passwordMin - 1)).toHaveLength(1);
		expect(await passwordErrors(passwordMax)).toHaveLength(0);
		expect(await passwordErrors(passwordMax + 1)).toHaveLength(1);
		expect(await nameErrors("a".repeat(nameMax))).toHaveLength(0);
		expect(await nameErrors("a".repeat(nameMax + 1))).toHaveLength(1);
	});

	it("allows letters with umlauts, digits, _ . and -", async () => {
		expect(await usernameErrors("Jürgen_K.-92")).toHaveLength(0);
	});

	it("rejects spaces and letters from other scripts", async () => {
		expect(await usernameErrors("Anna Maria")).toHaveLength(1);
		expect(await usernameErrors("Аdmin")).toHaveLength(1);
	});
});

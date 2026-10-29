import { describe, expect, it } from "vitest";

import { registrationSchema } from "@/lib/schemas/user.schemas";

// The first error message, as shown below the form field
const firstError = (values: { username: string; password: string }) =>
	registrationSchema.safeParse(values).error?.issues[0].message;

describe("registrationSchema", () => {
	it("accepts a valid username and password", () => {
		expect(
			registrationSchema.safeParse({ username: "tomate", password: "Tomate123!" }).success,
		).toBe(true);
	});

	it("rejects a too short username", () => {
		// At least 5 characters
		expect(firstError({ username: "tom", password: "Tomate123!" })).toBe(
			"Der Benutzername muss mindestens 5 Zeichen lang sein.",
		);
	});

	it("rejects a password without a special character", () => {
		// Upper and lower case letters and a number alone are not enough
		expect(firstError({ username: "tomate", password: "Tomate123" })).toBe(
			"Das Passwort muss mindestens ein Sonderzeichen enthalten.",
		);
	});
});

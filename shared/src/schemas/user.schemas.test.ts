import { describe, expect, it } from "vitest";

import { profileSchema, registrationSchema } from "./user.schemas";

// The first error message, as shown below the form field
const firstError = (values: { username: string; password: string }) =>
	registrationSchema.safeParse(values).error?.issues[0]?.message;

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

	it("allows letters with umlauts, digits, _ . and -", () => {
		expect(
			registrationSchema.safeParse({ username: "Jürgen_K.-92", password: "Tomate123!" })
				.success,
		).toBe(true);
	});

	it("rejects spaces and letters from other scripts", () => {
		for (const username of ["Anna Maria", "Аdmin"]) {
			expect(firstError({ username, password: "Tomate123!" })).toBe(
				"Der Benutzername darf nur Buchstaben, Ziffern und _ . - enthalten.",
			);
		}
	});

	it("rejects a reserved username", () => {
		expect(firstError({ username: "Admin_", password: "Tomate123!" })).toBe(
			"Dieser Benutzername ist nicht verfügbar.",
		);
	});
});

describe("profileSchema", () => {
	it("rejects a reserved profile name", () => {
		const result = profileSchema.safeParse({
			name: "FoodSwap Team",
			placeId: "",
			placeQuery: "",
		});

		expect(result.error?.issues[0]?.message).toBe("Dieser Name ist nicht verfügbar.");
	});
});

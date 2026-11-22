import { describe, expect, it } from "vitest";

import { isReservedName, normalizeName } from "./reservedNames";

describe("normalizeName", () => {
	it("ignores case, separators and common digit replacements", () => {
		expect(normalizeName("Food_Swap")).toBe("foodswap");
		expect(normalizeName("t.e.a.m")).toBe("team");
		expect(normalizeName("4dm1n")).toBe("admin");
	});

	it("keeps umlauts", () => {
		expect(normalizeName("Gelöschtes Konto")).toBe("gelöschteskonto");
	});
});

describe("isReservedName", () => {
	it("rejects reserved names in any spelling", () => {
		for (const name of [
			"admin",
			"ADMIN",
			"Admin_",
			"4dm1n",
			"Moderator",
			"Support",
			"Datenschutz",
		]) {
			expect(isReservedName(name)).toBe(true);
		}
	});

	it("catches separators and spaces inside a reserved name", () => {
		for (const name of ["Ad min", "A d m i n", "AD-MIN", "4d m1n"]) {
			expect(isReservedName(name)).toBe(true);
		}
	});

	it("rejects names that look like what the app shows for deleted accounts", () => {
		expect(isReservedName("Gelöschtes Konto")).toBe(true);
		expect(isReservedName("geloeschtes_konto")).toBe(true);
	});

	it("rejects everything that contains the brand", () => {
		for (const name of [
			"foodswap_team",
			"OfficialFoodSwap",
			"food.swap.support",
			"FoodSwap Team",
		]) {
			expect(isReservedName(name)).toBe(true);
		}
	});

	it("allows names that only contain a reserved word", () => {
		for (const name of ["badminton_fan", "teamplayer", "Anna Admiral", "tomate123"]) {
			expect(isReservedName(name)).toBe(false);
		}
	});
});

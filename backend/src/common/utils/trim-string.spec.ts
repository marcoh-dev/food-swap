import type { TransformFnParams } from "class-transformer";

import { toSlugArray, trimString } from "./trim-string";

// trimString is used in @Transform(), which passes more than the value
const trim = (value: unknown) => trimString({ value } as TransformFnParams);

describe("trim-string", () => {
	it("trims text", () => {
		// "  Tomaten " in a form is stored as "Tomaten"
		expect(trim("  Tomaten ")).toBe("Tomaten");
	});

	it("turns empty text into null", () => {
		// An optional field with only spaces counts as not filled in
		expect(trim("   ")).toBeNull();
	});

	it("splits a tag filter into slugs", () => {
		// ?tags=a, b,,c → spaces and empty parts are removed
		expect(toSlugArray("a, b,,c")).toEqual(["a", "b", "c"]);
	});
});

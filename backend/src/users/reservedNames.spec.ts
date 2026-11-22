import { readFileSync } from "node:fs";
import { join } from "node:path";

import { isReservedName } from "./reservedNames";

// The names between the brackets of the RESERVED_NAMES array in a file
function namesIn(path: string) {
	const source = readFileSync(path, "utf8");
	const list = /RESERVED_NAMES = \[([^\]]*)\]/.exec(source)?.[1] ?? "";
	return [...list.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

describe("reservedNames", () => {
	it("has the same names as the list in shared", () => {
		// Read as text: the backend's TypeScript setup can't import files outside the backend
		const shared = namesIn(join(__dirname, "../../../shared/src/reservedNames.ts"));
		const backend = namesIn(join(__dirname, "reservedNames.ts"));

		expect(backend.length).toBeGreaterThan(0);
		expect(backend).toEqual(shared);
	});

	it("rejects reserved names in any spelling and names with the brand", () => {
		expect(isReservedName("4dm1n")).toBe(true);
		expect(isReservedName("OfficialFoodSwap")).toBe(true);
		expect(isReservedName("badminton_fan")).toBe(false);
	});
});

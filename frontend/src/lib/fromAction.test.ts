import { describe, expect, it } from "vitest";

import { fromAction } from "@/lib/fromAction";

describe("fromAction", () => {
	it("returns the data of a successful action", async () => {
		await expect(fromAction(Promise.resolve({ data: 3 }))).resolves.toBe(3);
	});

	it("throws the action's error text", async () => {
		await expect(fromAction(Promise.resolve({ error: "Chat nicht gefunden" }))).rejects.toThrow(
			"Chat nicht gefunden",
		);
	});

	it("throws a text when the action can't run", async () => {
		await expect(fromAction(Promise.reject(new Error("fetch failed")))).rejects.toThrow(
			"Der Server ist nicht erreichbar. Versuche es später nochmal.",
		);
	});
});

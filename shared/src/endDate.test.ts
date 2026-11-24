import { describe, expect, it } from "vitest";

import { validateEndDate } from "./endDate";

const NOW = new Date("2026-11-20T12:00:00Z");

describe("validateEndDate", () => {
	it("accepts an empty end date", () => {
		expect(validateEndDate("", NOW)).toEqual({ ok: true, date: undefined });
	});

	it("accepts a day within the allowed range", () => {
		expect(validateEndDate("2026-12-01", NOW).ok).toBe(true);
	});

	it("rejects a day in the past", () => {
		expect(validateEndDate("2026-11-19", NOW)).toEqual({
			ok: false,
			error: "Das Enddatum muss in der Zukunft liegen.",
		});
	});

	it("rejects a day more than six months ahead", () => {
		expect(validateEndDate("2027-06-01", NOW).ok).toBe(false);
	});
});

import { describe, expect, it } from "vitest";

import { getBerlinDay, getDaysUntil } from "./dates";

// Ends on 20.11.2026 at 23:59:59.999 Berlin time
const END_DATE = "2026-11-20T22:59:59.999Z";

describe("getBerlinDay", () => {
	it("returns the Berlin day, not the UTC day", () => {
		// 23:30 UTC is already 00:30 the next day in Berlin
		expect(getBerlinDay(new Date("2026-11-19T23:30:00Z"))).toBe("2026-11-20");
	});

	it("uses Berlin summer time", () => {
		// 22:30 UTC is 00:30 the next day in Berlin during summer time
		expect(getBerlinDay(new Date("2026-07-01T22:30:00Z"))).toBe("2026-07-02");
	});
});

describe("getDaysUntil", () => {
	it("counts calendar days, not 24-hour periods", () => {
		// 34 hours before the end, but only one calendar day
		expect(getDaysUntil(END_DATE, new Date("2026-11-19T13:00:00Z"))).toBe(1);
	});

	it("returns 0 on the last day", () => {
		expect(getDaysUntil(END_DATE, new Date("2026-11-20T22:00:00Z"))).toBe(0);
	});

	it("returns a negative number after the end", () => {
		expect(getDaysUntil(END_DATE, new Date("2026-11-21T12:00:00Z"))).toBe(-1);
	});
});

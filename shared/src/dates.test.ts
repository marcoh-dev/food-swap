import { describe, expect, it } from "vitest";

import { formatTime, getBerlinDay, getDaysUntil } from "./dates";

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

describe("formatTime", () => {
	it("shows the Berlin time", () => {
		expect(formatTime("2026-11-19T13:05:00Z")).toBe("14:05");
	});

	it("returns an empty string for an invalid date", () => {
		expect(formatTime("not a date")).toBe("");
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

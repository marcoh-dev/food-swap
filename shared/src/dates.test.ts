import { describe, expect, it } from "vitest";

import {
	formatChatListTime,
	formatDayLabel,
	formatTime,
	getBerlinDay,
	getDaysUntil,
	getDeletionLabel,
	getEndDateLabel,
} from "./dates";

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

describe("getEndDateLabel", () => {
	it("counts down the last days", () => {
		expect(getEndDateLabel(0, END_DATE)).toBe("Läuft heute ab");
		expect(getEndDateLabel(1, END_DATE)).toBe("Noch 1 Tag");
		expect(getEndDateLabel(7, END_DATE)).toBe("Noch 7 Tage");
	});

	it("shows the end date further ahead", () => {
		expect(getEndDateLabel(8, END_DATE)).toBe("Bis 20.11.2026");
	});

	it("marks ended listings", () => {
		expect(getEndDateLabel(-1, END_DATE)).toBe("Abgelaufen");
	});
});

describe("getDeletionLabel", () => {
	it("shows no deletion date before the listing has ended", () => {
		// On its last day the listing is still active
		expect(getDeletionLabel(END_DATE, new Date("2026-11-20T12:00:00Z"))).toBeNull();
	});

	it("shows the deletion day the cleanup uses after the listing has ended", () => {
		// The cleanup deletes on end day + 29 (#98): 20.11. → 19.12.
		expect(getDeletionLabel(END_DATE, new Date("2026-11-21T12:00:00Z"))).toBe(
			"Wird am 19.12. gelöscht",
		);
	});
});

// 25.11.2026, 10:00 Berlin time
const NOW = new Date("2026-11-25T09:00:00Z");

describe("formatDayLabel", () => {
	it("says Heute and Gestern by the Berlin day", () => {
		expect(formatDayLabel("2026-11-25T08:00:00Z", NOW)).toBe("Heute");
		expect(formatDayLabel("2026-11-24T08:00:00Z", NOW)).toBe("Gestern");
	});

	it("shows the date for older days", () => {
		expect(formatDayLabel("2026-11-23T08:00:00Z", NOW)).toBe("23.11.2026");
	});

	it("counts days at midnight in Berlin, not in UTC", () => {
		// 23:30 UTC on the 24th is already 00:30 on the 25th in Berlin
		expect(formatDayLabel("2026-11-24T23:30:00Z", NOW)).toBe("Heute");
		// 22:30 UTC on the 23rd is 23:30 on the 23rd in Berlin
		expect(formatDayLabel("2026-11-23T22:30:00Z", NOW)).toBe("23.11.2026");
	});
});

describe("formatChatListTime", () => {
	it("shows the time today, Gestern yesterday and the date before", () => {
		expect(formatChatListTime("2026-11-25T08:05:00Z", NOW)).toBe("09:05");
		expect(formatChatListTime("2026-11-24T08:05:00Z", NOW)).toBe("Gestern");
		expect(formatChatListTime("2026-11-20T08:05:00Z", NOW)).toBe("20.11.2026");
	});
});

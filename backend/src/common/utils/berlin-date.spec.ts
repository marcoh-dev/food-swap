import { berlinDay, endOfDay, shiftDay } from "./berlin-date";

describe("berlin-date", () => {
	it("uses the Berlin calendar day, not the UTC day", () => {
		// 22:59 UTC is 23:59 in Berlin (winter time): still the same day
		expect(berlinDay(new Date("2026-11-20T22:59:00Z"))).toBe("2026-11-20");
		// 23:00 UTC is already midnight in Berlin: the next day
		expect(berlinDay(new Date("2026-11-20T23:00:00Z"))).toBe("2026-11-21");
	});

	it("shifts a day across a month end", () => {
		// The cleanup counts days back and forth, so month ends must not break it
		expect(shiftDay("2026-01-31", { days: 1 })).toBe("2026-02-01");
		expect(shiftDay("2026-03-01", { days: -1 })).toBe("2026-02-28");
	});

	it("ends the day at 23:59:59.999 Berlin time on the change to summer time", () => {
		// On 29.03.2026 Berlin switches to UTC+2, so the day ends at 21:59 UTC
		expect(endOfDay("2026-03-29").toISOString()).toBe("2026-03-29T21:59:59.999Z");
	});

	it("ends the day at 23:59:59.999 Berlin time on the change to winter time", () => {
		// On 25.10.2026 Berlin switches back to UTC+1, so the day ends at 22:59 UTC
		expect(endOfDay("2026-10-25").toISOString()).toBe("2026-10-25T22:59:59.999Z");
	});
});

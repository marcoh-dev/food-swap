import { describe, expect, it } from "vitest";

import { getDeletionLabel } from "@/utils/date";

// Ends on 20.11.2026 at 23:59:59.999 Berlin time
const END_DATE = "2026-11-20T22:59:59.999Z";

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

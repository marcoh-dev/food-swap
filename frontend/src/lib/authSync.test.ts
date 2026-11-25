import { afterEach, describe, expect, it, vi } from "vitest";

import { announceUser, watchOtherTabs } from "@/lib/authSync";

// Node has BroadcastChannel; messages reach the other channels of the same name in this process,
// like the other tabs in a browser
function waitForMessages() {
	return new Promise((resolve) => setTimeout(resolve, 20));
}

let stop: (() => void) | undefined;

afterEach(() => {
	stop?.();
	vi.unstubAllGlobals();
});

describe("auth sync across tabs", () => {
	it("tells a tab when another tab logged out", async () => {
		const onOtherUser = vi.fn();
		stop = watchOtherTabs("user-1", onOtherUser);

		announceUser(null);
		await waitForMessages();

		expect(onOtherUser).toHaveBeenCalledTimes(1);
	});

	it("tells a logged-out tab when another tab logged in", async () => {
		const onOtherUser = vi.fn();
		stop = watchOtherTabs(null, onOtherUser);

		announceUser("user-1");
		await waitForMessages();

		expect(onOtherUser).toHaveBeenCalledTimes(1);
	});

	it("ignores a tab that already shows the same user", async () => {
		const onOtherUser = vi.fn();
		stop = watchOtherTabs("user-1", onOtherUser);

		announceUser("user-1");
		await waitForMessages();

		expect(onOtherUser).not.toHaveBeenCalled();
	});

	it("does nothing without BroadcastChannel", () => {
		vi.stubGlobal("BroadcastChannel", undefined);

		expect(() => announceUser(null)).not.toThrow();
		expect(() => watchOtherTabs("user-1", vi.fn())()).not.toThrow();
	});
});

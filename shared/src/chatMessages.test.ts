import { describe, expect, it } from "vitest";

import { isSameMessageGroup } from "./chatMessages";
import type { ChatMessage } from "./types";

function message(senderId: string | null, createdAt: string): ChatMessage {
	return { id: createdAt, chatId: "chat-1", senderId, content: "Hallo", createdAt };
}

describe("isSameMessageGroup", () => {
	it("groups messages of the same person in the same minute", () => {
		expect(
			isSameMessageGroup(
				message("ole", "2026-11-20T13:05:00Z"),
				message("ole", "2026-11-20T13:05:59Z"),
			),
		).toBe(true);
	});

	it("starts a new group in the next minute", () => {
		expect(
			isSameMessageGroup(
				message("ole", "2026-11-20T13:05:50Z"),
				message("ole", "2026-11-20T13:06:05Z"),
			),
		).toBe(false);
	});

	it("starts a new group for the other person", () => {
		expect(
			isSameMessageGroup(
				message("ole", "2026-11-20T13:05:00Z"),
				message("jana", "2026-11-20T13:05:10Z"),
			),
		).toBe(false);
	});

	it("starts a new group on the next day at the same time", () => {
		expect(
			isSameMessageGroup(
				message("ole", "2026-11-20T13:05:00Z"),
				message("ole", "2026-11-21T13:05:00Z"),
			),
		).toBe(false);
	});

	it("groups messages of a deleted account", () => {
		expect(
			isSameMessageGroup(
				message(null, "2026-11-20T13:05:00Z"),
				message(null, "2026-11-20T13:05:20Z"),
			),
		).toBe(true);
	});
});

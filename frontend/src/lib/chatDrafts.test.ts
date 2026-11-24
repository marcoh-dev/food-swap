import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearChatDrafts, getChatDraft, listingDraftKey, setChatDraft } from "@/lib/chatDrafts";

// The tests run in Node, which has no sessionStorage; this one keeps entries in a Map
function createStorage(): Storage {
	const entries = new Map<string, string>();
	return {
		get length() {
			return entries.size;
		},
		key: (index) => [...entries.keys()][index] ?? null,
		getItem: (key) => entries.get(key) ?? null,
		setItem: (key, value) => entries.set(key, value),
		removeItem: (key) => entries.delete(key),
		clear: () => entries.clear(),
	};
}

beforeEach(() => {
	vi.stubGlobal("sessionStorage", createStorage());
});

describe("chat drafts", () => {
	it("keeps a draft per chat and per listing", () => {
		setChatDraft("chat-1", "Hallo Ole");
		setChatDraft(listingDraftKey("listing-1"), "Sind die Äpfel noch da?");

		expect(getChatDraft("chat-1")).toBe("Hallo Ole");
		expect(getChatDraft("chat-2")).toBe("");
		expect(getChatDraft(listingDraftKey("listing-1"))).toBe("Sind die Äpfel noch da?");
	});

	it("removes a draft when its text is empty", () => {
		setChatDraft("chat-1", "Hallo");
		setChatDraft("chat-1", "");

		expect(getChatDraft("chat-1")).toBe("");
		expect(sessionStorage.length).toBe(0);
	});

	it("clears all drafts but leaves other entries alone", () => {
		sessionStorage.setItem("other", "keep");
		setChatDraft("chat-1", "Hallo");
		setChatDraft(listingDraftKey("listing-1"), "Hi");

		clearChatDrafts();

		expect(getChatDraft("chat-1")).toBe("");
		expect(getChatDraft(listingDraftKey("listing-1"))).toBe("");
		expect(sessionStorage.getItem("other")).toBe("keep");
	});

	it("works without storage", () => {
		vi.stubGlobal("sessionStorage", undefined);

		expect(() => setChatDraft("chat-1", "Hallo")).not.toThrow();
		expect(getChatDraft("chat-1")).toBe("");
		expect(() => clearChatDrafts()).not.toThrow();
	});
});

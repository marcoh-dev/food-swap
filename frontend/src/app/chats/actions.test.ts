import { beforeEach, describe, expect, it, vi } from "vitest";

import { getChatAction } from "@/app/chats/actions";
import { getChat } from "@/lib/chats.service";

vi.mock("@/lib/chats.service", () => ({
	ApiError: class extends Error {},
	deleteChat: vi.fn(),
	getChat: vi.fn(),
	getChats: vi.fn(),
	getUnreadChatsCount: vi.fn(),
	markChatRead: vi.fn(),
	replyToChat: vi.fn(),
	startChat: vi.fn(),
}));

const CHAT_ID = "0b6c3f1e-8a52-4c1d-9f3e-2a7b5d9c4e10";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getChatAction", () => {
	it("returns 'Chat nicht gefunden' for an invalid id without asking the backend", async () => {
		expect(await getChatAction("abc")).toEqual({ error: "Chat nicht gefunden" });
		expect(getChat).not.toHaveBeenCalled();
	});

	it("loads the chat for a valid id", async () => {
		const chat = {
			id: CHAT_ID,
			listingId: null,
			listingTitle: null,
			otherName: null,
			canReply: true,
			messages: [],
		};
		vi.mocked(getChat).mockResolvedValueOnce(chat);

		expect(await getChatAction(CHAT_ID)).toEqual({ data: chat });
		expect(getChat).toHaveBeenCalledWith(CHAT_ID);
	});
});

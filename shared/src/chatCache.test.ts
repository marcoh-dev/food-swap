import { QueryClient } from "@tanstack/query-core";
import { beforeEach, describe, expect, it } from "vitest";

import {
	addMessageToCache,
	CHAT_LIST_QUERY_KEY,
	chatQueryKey,
	isChatInCache,
	removeChatFromCache,
	setChatUnreadInCache,
} from "./chatCache";
import type { ChatDetail, ChatListItem, ChatMessage } from "./types";

function listItem(id: string, unread = false): ChatListItem {
	return {
		id,
		listingTitle: "Äpfel",
		otherName: "Ole",
		lastMessage: "Hallo",
		lastMessageAt: "2026-11-20T10:00:00Z",
		unread,
	};
}

function message(id: string, chatId: string): ChatMessage {
	return {
		id,
		chatId,
		senderId: "other",
		content: `Nachricht ${id}`,
		createdAt: "2026-11-20T12:00:00Z",
	};
}

function detail(id: string, messages: ChatMessage[]): ChatDetail {
	return {
		id,
		listingId: "listing-1",
		listingTitle: "Äpfel",
		otherName: "Ole",
		canReply: true,
		messages,
	};
}

let queryClient: QueryClient;

const list = () => queryClient.getQueryData<ChatListItem[]>(CHAT_LIST_QUERY_KEY);
const chat = (id: string) => queryClient.getQueryData<ChatDetail>(chatQueryKey(id));

beforeEach(() => {
	queryClient = new QueryClient();
});

describe("addMessageToCache", () => {
	it("adds the message to the chat and moves the chat to the top with its unread state", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [listItem("chat-1"), listItem("chat-2")]);
		queryClient.setQueryData(
			chatQueryKey("chat-2"),
			detail("chat-2", [message("m1", "chat-2")]),
		);

		addMessageToCache(queryClient, message("m2", "chat-2"), { unread: true });

		expect(chat("chat-2")?.messages.map(({ id }) => id)).toEqual(["m1", "m2"]);
		expect(list()?.map(({ id }) => id)).toEqual(["chat-2", "chat-1"]);
		expect(list()?.[0]).toMatchObject({
			lastMessage: "Nachricht m2",
			lastMessageAt: "2026-11-20T12:00:00Z",
			unread: true,
		});
	});

	it("adds a message only once", () => {
		queryClient.setQueryData(
			chatQueryKey("chat-1"),
			detail("chat-1", [message("m1", "chat-1")]),
		);

		addMessageToCache(queryClient, message("m1", "chat-1"), { unread: false });

		expect(chat("chat-1")?.messages).toHaveLength(1);
	});

	it("leaves the list alone when the chat isn't in it yet", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [listItem("chat-1")]);

		addMessageToCache(queryClient, message("m1", "chat-new"), { unread: true });

		expect(list()?.map(({ id }) => id)).toEqual(["chat-1"]);
		expect(isChatInCache(queryClient, "chat-new")).toBe(false);
	});

	it("doesn't create a chat or a list that wasn't loaded", () => {
		addMessageToCache(queryClient, message("m1", "chat-1"), { unread: true });

		expect(chat("chat-1")).toBeUndefined();
		expect(list()).toBeUndefined();
	});
});

describe("setChatUnreadInCache", () => {
	it("changes only the given chat", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [
			listItem("chat-1", true),
			listItem("chat-2", true),
		]);

		setChatUnreadInCache(queryClient, "chat-1", false);

		expect(list()?.map(({ unread }) => unread)).toEqual([false, true]);
	});
});

describe("removeChatFromCache", () => {
	it("removes the chat from the list", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [listItem("chat-1"), listItem("chat-2")]);

		removeChatFromCache(queryClient, "chat-1");

		expect(list()?.map(({ id }) => id)).toEqual(["chat-2"]);
		expect(isChatInCache(queryClient, "chat-1")).toBe(false);
	});
});

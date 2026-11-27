import {
	addMessageToCache,
	CHAT_LIST_QUERY_KEY,
	chatQueryKey,
	UNREAD_CHATS_COUNT_QUERY_KEY,
} from "@food-swap/shared/chat-cache";
import type { ChatDetail, ChatListItem, ChatMessage } from "@food-swap/shared/types";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getChatsAction, markChatReadAction } from "@/app/chats/actions";
import { connectChat } from "@/lib/chatEvents";
import { currentPushSubscription } from "@/lib/webPush";
import { useChatStore } from "@/store/chat.store";

// Collects the socket listeners from connectChat, so the tests can send events
const listeners = vi.hoisted(() => new Map<string, (payload?: unknown) => void>());

vi.mock("@/socket", () => ({
	socket: {
		on: (event: string, listener: (payload?: unknown) => void) =>
			listeners.set(event, listener),
		off: (event: string) => listeners.delete(event),
		connect: vi.fn(),
		disconnect: vi.fn(),
	},
}));

vi.mock("@/app/chats/actions", () => ({
	deleteChatAction: vi.fn(),
	getChatAction: vi.fn(),
	getChatsAction: vi.fn(),
	getSocketTicketAction: vi.fn(),
	getUnreadChatsCountAction: vi.fn(),
	markChatReadAction: vi.fn(),
	replyToChatAction: vi.fn(),
	startChatAction: vi.fn(),
}));

vi.mock("@/lib/webPush", () => ({ currentPushSubscription: vi.fn() }));

const ME = "user-me";
const OTHER = "user-other";

let messageCount = 0;

function message(chatId: string, senderId: string): ChatMessage {
	messageCount += 1;
	return {
		id: `message-${messageCount}`,
		chatId,
		senderId,
		content: `Nachricht ${messageCount}`,
		createdAt: new Date(Date.UTC(2026, 10, 20, 12, 0, messageCount)).toISOString(),
	};
}

function chatItem(id: string, unread = false): ChatListItem {
	return {
		id,
		listingTitle: "Äpfel",
		otherName: "Anna",
		lastMessage: null,
		lastMessageAt: "2026-11-20T10:00:00.000Z",
		unread,
	};
}

function chatDetail(id: string, messages: ChatMessage[] = []): ChatDetail {
	return {
		id,
		listingId: "listing-1",
		listingTitle: "Äpfel",
		otherName: "Anna",
		canReply: true,
		messages,
	};
}

function emit(event: string, payload?: unknown) {
	listeners.get(event)?.(payload);
}

// Lets the mocked server actions resolve
function flush() {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

// The tests run in Node, which has no document; this one only knows visibility
const fakeDocument = Object.assign(new EventTarget(), { hidden: false });
vi.stubGlobal("document", fakeDocument);

function setTabHidden(hidden: boolean) {
	fakeDocument.hidden = hidden;
	fakeDocument.dispatchEvent(new Event("visibilitychange"));
}

let queryClient: QueryClient;
let disconnect: () => void;
const onSessionEnded = vi.fn();

const chats = () => queryClient.getQueryData<ChatListItem[]>(CHAT_LIST_QUERY_KEY);
const chatIds = () => chats()?.map(({ id }) => id);
const conversation = (chatId: string) => queryClient.getQueryData<ChatDetail>(chatQueryKey(chatId));
const isOutdated = (queryKey: string[]) => queryClient.getQueryState(queryKey)?.isInvalidated;

// What ChatConversation does: the chat is open, and loaded if its data is given
function openChat(chatId: string, detail?: ChatDetail) {
	useChatStore.getState().setOpenChatId(chatId);
	if (detail) queryClient.setQueryData(chatQueryKey(chatId), detail);
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(getChatsAction).mockResolvedValue({ data: [] });
	vi.mocked(markChatReadAction).mockResolvedValue({ data: null });
	fakeDocument.hidden = false;
	queryClient = new QueryClient();
	queryClient.setQueryData(UNREAD_CHATS_COUNT_QUERY_KEY, 1);
	disconnect = connectChat({
		queryClient,
		userId: ME,
		onNotificationClick: vi.fn(),
		onSessionEnded,
	});
});

afterEach(() => disconnect());

describe("newMessage", () => {
	it("adds a message from the other user to the open chat and keeps it read", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-1"), chatItem("chat-2")]);
		openChat("chat-2", chatDetail("chat-2"));

		const incoming = message("chat-2", OTHER);
		emit("newMessage", incoming);

		expect(conversation("chat-2")?.messages).toEqual([incoming]);
		expect(chatIds()).toEqual(["chat-2", "chat-1"]);
		expect(chats()?.[0]).toMatchObject({ lastMessage: incoming.content, unread: false });
		expect(isOutdated(UNREAD_CHATS_COUNT_QUERY_KEY)).toBe(false);
	});

	it("marks a message in the open chat as unread while it's scrolled up", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-1")]);
		openChat("chat-1", chatDetail("chat-1"));
		useChatStore.getState().setAtNewest(false);

		emit("newMessage", message("chat-1", OTHER));

		expect(chats()?.[0]?.unread).toBe(true);
		expect(isOutdated(UNREAD_CHATS_COUNT_QUERY_KEY)).toBe(true);
	});

	it("marks another chat as unread, moves it to the top and reloads the unread count", async () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-1"), chatItem("chat-2")]);

		emit("newMessage", message("chat-2", OTHER));
		await flush();

		expect(chatIds()).toEqual(["chat-2", "chat-1"]);
		expect(chats()?.[0]?.unread).toBe(true);
		expect(isOutdated(UNREAD_CHATS_COUNT_QUERY_KEY)).toBe(true);
		expect(markChatReadAction).not.toHaveBeenCalled();
	});

	it("reloads the chat list when the chat is not in it yet", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-1")]);

		emit("newMessage", message("chat-new", OTHER));

		expect(isOutdated(CHAT_LIST_QUERY_KEY)).toBe(true);
	});

	it("doesn't mark own messages as unread", async () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-1"), chatItem("chat-2")]);

		emit("newMessage", message("chat-2", ME));
		await flush();

		expect(chatIds()).toEqual(["chat-2", "chat-1"]);
		expect(chats()?.[0]?.unread).toBe(false);
		expect(isOutdated(UNREAD_CHATS_COUNT_QUERY_KEY)).toBe(false);
		expect(markChatReadAction).not.toHaveBeenCalled();
	});

	it("counts a chat that is still loading as open", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-1"), chatItem("chat-2")]);
		openChat("chat-2");

		emit("newMessage", message("chat-2", OTHER));

		expect(chats()?.[0]?.unread).toBe(false);
	});

	it("shows an own reply only once when the socket sends it back", () => {
		openChat("chat-1", chatDetail("chat-1"));
		const reply = message("chat-1", ME);

		// What useSendReply does with the answer to sending
		addMessageToCache(queryClient, reply, { unread: false });
		emit("newMessage", reply);

		expect(conversation("chat-1")?.messages).toEqual([reply]);
	});
});

describe("hidden tab", () => {
	it("keeps a message in the open chat unread while the tab is hidden", async () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-1")]);
		openChat("chat-1", chatDetail("chat-1"));
		setTabHidden(true);

		emit("newMessage", message("chat-1", OTHER));
		await flush();

		expect(chats()?.[0]?.unread).toBe(true);
		expect(isOutdated(UNREAD_CHATS_COUNT_QUERY_KEY)).toBe(true);
		expect(markChatReadAction).not.toHaveBeenCalled();
	});

	it("only notes the tab's visibility; marking read happens in the conversation", () => {
		openChat("chat-1", chatDetail("chat-1"));
		setTabHidden(true);

		setTabHidden(false);

		expect(useChatStore.getState().tabVisible).toBe(true);
		expect(markChatReadAction).not.toHaveBeenCalled();
	});
});

describe("chatRead", () => {
	it("marks the chat as read and reloads the unread count", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-1", true)]);

		emit("chatRead", { chatId: "chat-1" });

		expect(chats()?.[0]?.unread).toBe(false);
		expect(isOutdated(UNREAD_CHATS_COUNT_QUERY_KEY)).toBe(true);
	});
});

describe("chatRemoved", () => {
	it("removes the chat from the list and closes it if it's open", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-1"), chatItem("chat-2")]);
		openChat("chat-1", chatDetail("chat-1"));

		emit("chatRemoved", { chatId: "chat-1" });

		expect(chatIds()).toEqual(["chat-2"]);
		expect(conversation("chat-1")).toBeUndefined();
		expect(useChatStore.getState().removedChatId).toBe("chat-1");
		expect(isOutdated(UNREAD_CHATS_COUNT_QUERY_KEY)).toBe(true);
	});

	it("closes a chat that is deleted while it's loading", () => {
		openChat("chat-1");

		emit("chatRemoved", { chatId: "chat-1" });

		expect(useChatStore.getState().removedChatId).toBe("chat-1");
	});

	it("doesn't close another chat", () => {
		openChat("chat-2", chatDetail("chat-2"));

		emit("chatRemoved", { chatId: "chat-1" });

		expect(useChatStore.getState().removedChatId).toBeNull();
		expect(conversation("chat-2")).toBeDefined();
	});
});

describe("server disconnect", () => {
	it("reports the end of the session once when the server ends the connection", () => {
		emit("disconnect", "io server disconnect");
		emit("disconnect", "io server disconnect");

		expect(onSessionEnded).toHaveBeenCalledTimes(1);
	});

	it("doesn't report it when the connection drops for other reasons", () => {
		emit("disconnect", "transport close");

		expect(onSessionEnded).not.toHaveBeenCalled();
	});
});

describe("reconnect", () => {
	it("doesn't reload anything on the first connect", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-1")]);

		emit("connect");

		expect(isOutdated(CHAT_LIST_QUERY_KEY)).toBe(false);
	});

	it("reloads all chat data after reconnecting", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-1")]);
		openChat("chat-1", chatDetail("chat-1"));
		emit("connect");
		emit("disconnect", "transport close");

		emit("connect");

		expect(isOutdated(CHAT_LIST_QUERY_KEY)).toBe(true);
		expect(isOutdated(chatQueryKey("chat-1"))).toBe(true);
		expect(isOutdated(UNREAD_CHATS_COUNT_QUERY_KEY)).toBe(true);
	});
});

describe("browser notifications", () => {
	const shown: string[] = [];

	// Node has no window or Notification; just enough for notifications with permission granted
	class FakeNotification {
		static permission = "granted";
		onclick: (() => void) | null = null;
		constructor(title: string) {
			shown.push(title);
		}
		close() {}
	}

	beforeEach(() => {
		shown.length = 0;
		vi.stubGlobal("window", globalThis);
		vi.stubGlobal("Notification", FakeNotification);
	});

	afterEach(() => {
		vi.stubGlobal("window", undefined);
		vi.stubGlobal("Notification", undefined);
	});

	it("shows a notification in the tab when this browser has no push subscription", async () => {
		vi.mocked(currentPushSubscription).mockResolvedValue(null);
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-2")]);

		emit("newMessage", message("chat-2", OTHER));
		await flush();

		expect(shown).toEqual(["Neue Nachricht von Anna"]);
	});

	it("leaves it to the service worker when this browser has a push subscription", async () => {
		vi.mocked(currentPushSubscription).mockResolvedValue({} as PushSubscription);

		emit("newMessage", message("chat-2", OTHER));
		await flush();

		expect(shown).toEqual([]);
	});
});

describe("logout", () => {
	it("clears the chat data and the store", () => {
		queryClient.setQueryData(CHAT_LIST_QUERY_KEY, [chatItem("chat-1")]);
		openChat("chat-1", chatDetail("chat-1"));

		disconnect();

		expect(chats()).toBeUndefined();
		expect(conversation("chat-1")).toBeUndefined();
		expect(useChatStore.getState()).toMatchObject({ userId: null, openChatId: null });
	});
});

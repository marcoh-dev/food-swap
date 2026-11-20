import type { ChatDetail, ChatListItem, ChatMessage } from "@food-swap/shared/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	getChatAction,
	getChatsAction,
	getUnreadChatsCountAction,
	markChatReadAction,
	replyToChatAction,
} from "@/app/actions";
import { connectChat } from "@/lib/chatEvents";
import type { ActionResult } from "@/lib/types/common.types";
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

vi.mock("@/app/actions", () => ({
	deleteChatAction: vi.fn(),
	getChatAction: vi.fn(),
	getChatsAction: vi.fn(),
	getUnreadChatsCountAction: vi.fn(),
	markChatReadAction: vi.fn(),
	replyToChatAction: vi.fn(),
	startChatAction: vi.fn(),
}));

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

async function openChat(chat: ChatDetail) {
	vi.mocked(getChatAction).mockResolvedValueOnce({ data: chat });
	await useChatStore.getState().openChat(chat.id);
}

function chatIds() {
	return useChatStore.getState().chats?.map((chat) => chat.id);
}

let disconnect: () => void;

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(getChatsAction).mockResolvedValue({ data: [] });
	vi.mocked(getUnreadChatsCountAction).mockResolvedValue({ data: 0 });
	vi.mocked(markChatReadAction).mockResolvedValue({ data: null });
	disconnect = connectChat({ token: "token", userId: ME, onNotificationClick: vi.fn() });
});

afterEach(() => disconnect());

describe("newMessage", () => {
	it("adds a message from the other user to the open chat and marks it read", async () => {
		useChatStore.setState({ chats: [chatItem("chat-1"), chatItem("chat-2")] });
		await openChat(chatDetail("chat-2"));
		vi.clearAllMocks();

		const incoming = message("chat-2", OTHER);
		emit("newMessage", incoming);
		await flush();

		const { conversation, chats } = useChatStore.getState();
		expect(conversation?.messages).toEqual([incoming]);
		expect(markChatReadAction).toHaveBeenCalledWith("chat-2");
		expect(getUnreadChatsCountAction).not.toHaveBeenCalled();
		expect(chatIds()).toEqual(["chat-2", "chat-1"]);
		expect(chats?.[0]).toMatchObject({ lastMessage: incoming.content, unread: false });
	});

	it("marks another chat as unread, moves it to the top and reloads the unread count", async () => {
		useChatStore.setState({ chats: [chatItem("chat-1"), chatItem("chat-2")] });

		emit("newMessage", message("chat-2", OTHER));
		await flush();

		expect(chatIds()).toEqual(["chat-2", "chat-1"]);
		expect(useChatStore.getState().chats?.[0]?.unread).toBe(true);
		expect(getUnreadChatsCountAction).toHaveBeenCalled();
		expect(markChatReadAction).not.toHaveBeenCalled();
	});

	it("reloads the chat list when the chat is not in it yet", async () => {
		useChatStore.setState({ chats: [chatItem("chat-1")] });
		vi.mocked(getChatsAction).mockResolvedValueOnce({
			data: [chatItem("chat-new", true), chatItem("chat-1")],
		});

		emit("newMessage", message("chat-new", OTHER));
		await flush();

		expect(getChatsAction).toHaveBeenCalled();
		expect(chatIds()).toEqual(["chat-new", "chat-1"]);
	});

	it("doesn't mark own messages as unread", async () => {
		useChatStore.setState({ chats: [chatItem("chat-1"), chatItem("chat-2")] });

		emit("newMessage", message("chat-2", ME));
		await flush();

		expect(chatIds()).toEqual(["chat-2", "chat-1"]);
		expect(useChatStore.getState().chats?.[0]?.unread).toBe(false);
		expect(getUnreadChatsCountAction).not.toHaveBeenCalled();
		expect(markChatReadAction).not.toHaveBeenCalled();
	});

	it("counts a chat that is still loading as open", async () => {
		useChatStore.setState({ chats: [chatItem("chat-1"), chatItem("chat-2")] });
		const loading = Promise.withResolvers<ActionResult<ChatDetail>>();
		vi.mocked(getChatAction).mockReturnValueOnce(loading.promise);
		const opening = useChatStore.getState().openChat("chat-2");

		emit("newMessage", message("chat-2", OTHER));
		await flush();

		expect(useChatStore.getState().chats?.[0]?.unread).toBe(false);
		expect(markChatReadAction).toHaveBeenCalledWith("chat-2");
		expect(getUnreadChatsCountAction).not.toHaveBeenCalled();

		loading.resolve({ data: chatDetail("chat-2") });
		await opening;
	});

	it("shows an own reply only once when the socket sends it back", async () => {
		await openChat(chatDetail("chat-1"));
		const reply = message("chat-1", ME);
		vi.mocked(replyToChatAction).mockResolvedValueOnce({ data: reply });

		await useChatStore.getState().sendReply(reply.content);
		emit("newMessage", reply);

		expect(useChatStore.getState().conversation?.messages).toEqual([reply]);
	});
});

describe("chatRead", () => {
	it("marks the chat as read and reloads the unread count", async () => {
		useChatStore.setState({ chats: [chatItem("chat-1", true)], unreadCount: 1 });

		emit("chatRead", { chatId: "chat-1" });
		await flush();

		const { chats, unreadCount } = useChatStore.getState();
		expect(chats?.[0]?.unread).toBe(false);
		expect(unreadCount).toBe(0);
	});
});

describe("chatRemoved", () => {
	it("removes the chat from the list and closes it if it's open", async () => {
		useChatStore.setState({ chats: [chatItem("chat-1"), chatItem("chat-2")] });
		await openChat(chatDetail("chat-1"));
		vi.clearAllMocks();

		emit("chatRemoved", { chatId: "chat-1" });
		await flush();

		const { conversation, conversationError } = useChatStore.getState();
		expect(chatIds()).toEqual(["chat-2"]);
		expect(conversation).toBeNull();
		expect(conversationError).toBe("Dieser Chat wurde gelöscht.");
		expect(getUnreadChatsCountAction).toHaveBeenCalled();
	});
	it("closes a chat that is deleted while it's loading", async () => {
		const loading = Promise.withResolvers<ActionResult<ChatDetail>>();
		vi.mocked(getChatAction).mockReturnValueOnce(loading.promise);
		const opening = useChatStore.getState().openChat("chat-1");

		emit("chatRemoved", { chatId: "chat-1" });
		loading.resolve({ error: "Chat nicht gefunden" });
		await opening;

		const { openChatId, conversationError } = useChatStore.getState();
		expect(openChatId).toBeNull();
		expect(conversationError).toBe("Dieser Chat wurde gelöscht.");
	});
});

describe("reconnect", () => {
	it("reloads the unread count, the chat list and the open chat", async () => {
		useChatStore.setState({ chats: [chatItem("chat-1")] });
		await openChat(chatDetail("chat-1"));
		emit("disconnect");
		expect(useChatStore.getState().connected).toBe(false);
		vi.clearAllMocks();

		// A message that was sent while the connection was down
		const missed = message("chat-1", OTHER);
		vi.mocked(getChatAction).mockResolvedValueOnce({ data: chatDetail("chat-1", [missed]) });

		emit("connect");
		await flush();

		const { connected, conversation } = useChatStore.getState();
		expect(connected).toBe(true);
		expect(getUnreadChatsCountAction).toHaveBeenCalled();
		expect(getChatsAction).toHaveBeenCalled();
		expect(conversation?.messages).toEqual([missed]);
	});

	it("doesn't load the chat list if it was never loaded", async () => {
		emit("connect");
		await flush();

		expect(getChatsAction).not.toHaveBeenCalled();
	});
});

describe("openChat", () => {
	it("keeps the chat opened last when an earlier one finishes loading later", async () => {
		const first = Promise.withResolvers<ActionResult<ChatDetail>>();
		vi.mocked(getChatAction).mockReturnValueOnce(first.promise);

		const openingFirst = useChatStore.getState().openChat("chat-1");
		await openChat(chatDetail("chat-2"));
		first.resolve({ data: chatDetail("chat-1") });
		await openingFirst;

		expect(useChatStore.getState().conversation?.id).toBe("chat-2");
	});

	it("shows the error when the chat can't be loaded", async () => {
		vi.mocked(getChatAction).mockResolvedValueOnce({ error: "Chat nicht gefunden" });

		await useChatStore.getState().openChat("chat-1");

		const { conversation, conversationError } = useChatStore.getState();
		expect(conversation).toBeNull();
		expect(conversationError).toBe("Chat nicht gefunden");
	});
});

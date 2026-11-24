import type { QueryClient } from "@tanstack/query-core";

import type { ChatDetail, ChatListItem, ChatMessage } from "./types";

// TanStack Query cache keys and updates for the chat, the same in the app and on the web.
// Only types come from TanStack (query-core), so this package doesn't depend on it at runtime.

/** Prefix of all chat queries, e.g. to reload everything after the socket reconnected. */
export const CHATS_QUERY_KEY = ["chats"];
export const CHAT_LIST_QUERY_KEY = [...CHATS_QUERY_KEY, "list"];
export const UNREAD_CHATS_COUNT_QUERY_KEY = [...CHATS_QUERY_KEY, "unread-count"];

export function chatQueryKey(chatId: string) {
	return [...CHATS_QUERY_KEY, "detail", chatId];
}

/**
 * Adds a message to the cached chat and moves the chat to the top of the cached list with the
 * given unread state. A message can arrive twice (as the answer to sending it and over the
 * socket), so it's only added once.
 */
export function addMessageToCache(
	queryClient: QueryClient,
	message: ChatMessage,
	{ unread }: { unread: boolean },
) {
	queryClient.setQueryData<ChatDetail>(chatQueryKey(message.chatId), (chat) =>
		chat && !chat.messages.some((existing) => existing.id === message.id)
			? { ...chat, messages: [...chat.messages, message] }
			: chat,
	);

	queryClient.setQueryData<ChatListItem[]>(CHAT_LIST_QUERY_KEY, (chats) => {
		const chat = chats?.find((item) => item.id === message.chatId);
		if (!chats || !chat) return chats;

		return [
			{ ...chat, lastMessage: message.content, lastMessageAt: message.createdAt, unread },
			...chats.filter((item) => item.id !== chat.id),
		];
	});
}

/** Whether a chat is in the cached list; a new chat isn't until the list is reloaded. */
export function isChatInCache(queryClient: QueryClient, chatId: string) {
	return (
		queryClient
			.getQueryData<ChatListItem[]>(CHAT_LIST_QUERY_KEY)
			?.some((chat) => chat.id === chatId) ?? false
	);
}

/** Sets a chat in the cached list to read or unread. */
export function setChatUnreadInCache(queryClient: QueryClient, chatId: string, unread: boolean) {
	queryClient.setQueryData<ChatListItem[]>(CHAT_LIST_QUERY_KEY, (chats) =>
		chats?.map((chat) => (chat.id === chatId ? { ...chat, unread } : chat)),
	);
}

/** Removes a chat from the cached list. */
export function removeChatFromCache(queryClient: QueryClient, chatId: string) {
	queryClient.setQueryData<ChatListItem[]>(CHAT_LIST_QUERY_KEY, (chats) =>
		chats?.filter((chat) => chat.id !== chatId),
	);
}

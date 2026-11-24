import type { ChatDetail, ChatListItem, ChatMessage } from "@food-swap/shared/types";
import type { QueryClient } from "@tanstack/react-query";

import type { ActionResult } from "@/lib/types/common.types";

/** Prefix of all chat queries, e.g. to reload everything after the socket reconnected. */
export const CHATS_QUERY_KEY = ["chats"];
export const CHAT_LIST_QUERY_KEY = [...CHATS_QUERY_KEY, "list"];
export const UNREAD_CHATS_COUNT_QUERY_KEY = [...CHATS_QUERY_KEY, "unread-count"];

export function chatQueryKey(chatId: string) {
	return [...CHATS_QUERY_KEY, "detail", chatId];
}

/**
 * Returns the data of a server action, or throws its error text, so TanStack Query treats it as
 * an error. The actions turn backend errors into texts; this adds the one for when they can't run.
 */
export async function fromAction<T>(action: Promise<ActionResult<T>>): Promise<T> {
	let result: ActionResult<T>;
	try {
		result = await action;
	} catch {
		throw new Error("Der Server ist nicht erreichbar. Versuche es später nochmal.");
	}

	if (result.error !== undefined) throw new Error(result.error);
	return result.data;
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

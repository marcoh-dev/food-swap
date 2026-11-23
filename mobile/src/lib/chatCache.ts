import type { ChatDetail, ChatListItem, ChatMessage } from "@food-swap/shared/types";
import type { QueryClient } from "@tanstack/react-query";

import { CHAT_LIST_QUERY_KEY, chatQueryKey } from "@/api/chats";

/**
 * Adds a message to the cached chat and moves the chat to the top of the cached list, so the
 * screens update without reloading. A message can arrive twice (as the answer to sending it and
 * over the socket), so it's only added once.
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

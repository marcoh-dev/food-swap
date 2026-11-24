import { chatQueryKey } from "@food-swap/shared/chat-cache";
import { useQuery } from "@tanstack/react-query";

import { fetchChat } from "@/api/chats";

/** One chat with its messages, oldest first; pass `enabled: false` for an invalid ID. */
export function useChat(chatId: string, { enabled = true } = {}) {
	return useQuery({
		queryKey: chatQueryKey(chatId),
		queryFn: ({ signal }) => fetchChat(chatId, signal),
		enabled,
	});
}

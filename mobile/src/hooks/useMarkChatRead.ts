import type { ChatListItem } from "@food-swap/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CHAT_LIST_QUERY_KEY, markChatRead, UNREAD_CHATS_COUNT_QUERY_KEY } from "@/api/chats";

export function useMarkChatRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: markChatRead,
		onSuccess: (_result, chatId) => {
			queryClient.setQueryData<ChatListItem[]>(CHAT_LIST_QUERY_KEY, (chats) =>
				chats?.map((chat) => (chat.id === chatId ? { ...chat, unread: false } : chat)),
			);
			// The backend knows how many chats are still unread
			void queryClient.invalidateQueries({ queryKey: UNREAD_CHATS_COUNT_QUERY_KEY });
		},
	});
}

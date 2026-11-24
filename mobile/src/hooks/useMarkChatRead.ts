import { setChatUnreadInCache, UNREAD_CHATS_COUNT_QUERY_KEY } from "@food-swap/shared/chat-cache";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markChatRead } from "@/api/chats";

export function useMarkChatRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: markChatRead,
		onSuccess: (_result, chatId) => {
			setChatUnreadInCache(queryClient, chatId, false);
			// The backend knows how many chats are still unread
			void queryClient.invalidateQueries({ queryKey: UNREAD_CHATS_COUNT_QUERY_KEY });
		},
	});
}

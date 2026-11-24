import {
	chatQueryKey,
	removeChatFromCache,
	UNREAD_CHATS_COUNT_QUERY_KEY,
} from "@food-swap/shared/chat-cache";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteChat, LISTING_CHATS_QUERY_KEY } from "@/api/chats";
import { setChatDraft } from "@/lib/chatDrafts";

export function useDeleteChat() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteChat,
		onSuccess: (_result, chatId) => {
			removeChatFromCache(queryClient, chatId);
			// Only marked as outdated: refetching it now would fail while the screen closes
			void queryClient.invalidateQueries({
				queryKey: chatQueryKey(chatId),
				refetchType: "none",
			});
			void queryClient.invalidateQueries({ queryKey: UNREAD_CHATS_COUNT_QUERY_KEY });
			// The listing's message card offers to continue the chat
			void queryClient.invalidateQueries({ queryKey: LISTING_CHATS_QUERY_KEY });
			setChatDraft(chatId, "");
		},
	});
}

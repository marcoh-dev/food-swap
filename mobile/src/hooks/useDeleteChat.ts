import type { ChatListItem } from "@food-swap/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	CHAT_LIST_QUERY_KEY,
	chatQueryKey,
	deleteChat,
	LISTING_CHATS_QUERY_KEY,
	UNREAD_CHATS_COUNT_QUERY_KEY,
} from "@/api/chats";
import { setChatDraft } from "@/lib/chatDrafts";

export function useDeleteChat() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteChat,
		onSuccess: (_result, chatId) => {
			queryClient.setQueryData<ChatListItem[]>(CHAT_LIST_QUERY_KEY, (chats) =>
				chats?.filter((chat) => chat.id !== chatId),
			);
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

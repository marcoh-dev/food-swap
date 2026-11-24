import { CHAT_LIST_QUERY_KEY } from "@food-swap/shared/chat-cache";
import type { ListingChatStatus } from "@food-swap/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { listingChatQueryKey, startChat } from "@/api/chats";
import { listingDraftKey, setChatDraft } from "@/lib/chatDrafts";

export function useStartChat(listingId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (content: string) => startChat(listingId, content),
		onSuccess: (message) => {
			queryClient.setQueryData<ListingChatStatus>(listingChatQueryKey(listingId), {
				chatId: message.chatId,
				hidden: false,
			});
			// A new or continued chat isn't in the list yet
			void queryClient.invalidateQueries({ queryKey: CHAT_LIST_QUERY_KEY });
			setChatDraft(listingDraftKey(listingId), "");
		},
	});
}

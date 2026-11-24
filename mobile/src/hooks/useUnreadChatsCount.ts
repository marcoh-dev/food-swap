import { UNREAD_CHATS_COUNT_QUERY_KEY } from "@food-swap/shared/chat-cache";
import { useQuery } from "@tanstack/react-query";

import { fetchUnreadChatsCount } from "@/api/chats";

/** Number of chats with unread messages; pass `enabled: false` while logged out. */
export function useUnreadChatsCount({ enabled = true } = {}) {
	return useQuery({
		queryKey: UNREAD_CHATS_COUNT_QUERY_KEY,
		queryFn: ({ signal }) => fetchUnreadChatsCount(signal),
		enabled,
	});
}

import { CHAT_LIST_QUERY_KEY } from "@food-swap/shared/chat-cache";
import { useQuery } from "@tanstack/react-query";

import { fetchChats } from "@/api/chats";

/** The logged-in user's chats, newest message first (sorted by the backend). */
export function useChats() {
	return useQuery({
		queryKey: CHAT_LIST_QUERY_KEY,
		queryFn: ({ signal }) => fetchChats(signal),
	});
}

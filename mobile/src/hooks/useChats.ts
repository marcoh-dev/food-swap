import { useQuery } from "@tanstack/react-query";

import { CHAT_LIST_QUERY_KEY, fetchChats } from "@/api/chats";

/** The logged-in user's chats, newest message first (sorted by the backend). */
export function useChats() {
	return useQuery({
		queryKey: CHAT_LIST_QUERY_KEY,
		queryFn: ({ signal }) => fetchChats(signal),
	});
}

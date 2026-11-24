import { useQuery } from "@tanstack/react-query";

import { fetchListingChat, listingChatQueryKey } from "@/api/chats";

/** Whether the current user already has a chat about a listing, and whether they deleted it. */
export function useListingChat(listingId: string) {
	return useQuery({
		queryKey: listingChatQueryKey(listingId),
		queryFn: ({ signal }) => fetchListingChat(listingId, signal),
	});
}

import { useQuery } from "@tanstack/react-query";

import { CURRENT_USER_QUERY_KEY, fetchCurrentUser } from "@/api/auth";

/** The logged-in user; pass `enabled: false` on screens that are also open to guests. */
export function useCurrentUser({ enabled = true } = {}) {
	return useQuery({
		queryKey: CURRENT_USER_QUERY_KEY,
		queryFn: ({ signal }) => fetchCurrentUser(signal),
		enabled,
	});
}

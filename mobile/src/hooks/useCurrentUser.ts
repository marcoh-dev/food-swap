import { useQuery } from "@tanstack/react-query";

import { CURRENT_USER_QUERY_KEY, fetchCurrentUser } from "@/api/auth";

export function useCurrentUser() {
	return useQuery({
		queryKey: CURRENT_USER_QUERY_KEY,
		queryFn: ({ signal }) => fetchCurrentUser(signal),
	});
}

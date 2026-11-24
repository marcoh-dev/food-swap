import { useQuery } from "@tanstack/react-query";

import { fetchUser, USERS_QUERY_KEY } from "@/api/users";

/** A user's public profile; waits until `id` is known. */
export function useUser(id: string | undefined) {
	return useQuery({
		queryKey: [...USERS_QUERY_KEY, id],
		queryFn: ({ signal }) => fetchUser(id!, signal),
		enabled: !!id,
	});
}

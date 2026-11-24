import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CURRENT_USER_QUERY_KEY } from "@/api/auth";
import { type ProfileUpdate, updateUser, USERS_QUERY_KEY } from "@/api/users";

/** Saves the profile, then reloads both the private (/auth/me) and public (/users/:id) data. */
export function useUpdateProfile(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (values: ProfileUpdate) => updateUser(id, values),
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY }),
				queryClient.invalidateQueries({ queryKey: [...USERS_QUERY_KEY, id] }),
			]),
	});
}

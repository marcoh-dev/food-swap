import { useMutation } from "@tanstack/react-query";

import { deleteUser } from "@/api/users";
import { useAuth } from "@/components/AuthProvider";

/** Deletes the account, then logs out locally (the backend already deleted the refresh tokens). */
export function useDeleteAccount({ onDeleted }: { onDeleted?: () => void } = {}) {
	const { logOut } = useAuth();

	return useMutation({
		mutationFn: deleteUser,
		onSuccess: async () => {
			onDeleted?.();
			await logOut();
		},
	});
}

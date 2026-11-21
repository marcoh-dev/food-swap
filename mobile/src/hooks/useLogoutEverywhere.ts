import { useMutation } from "@tanstack/react-query";

import { logoutEverywhere } from "@/api/auth";
import { useAuth } from "@/components/AuthProvider";

export function useLogoutEverywhere() {
	const { logOut } = useAuth();

	return useMutation({
		mutationFn: logoutEverywhere,
		onSuccess: logOut,
	});
}

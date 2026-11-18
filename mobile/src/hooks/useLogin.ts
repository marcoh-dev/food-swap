import { useMutation } from "@tanstack/react-query";

import { login } from "@/api/auth";
import { useAuth } from "@/components/AuthProvider";

export function useLogin() {
	const { logIn } = useAuth();

	return useMutation({
		mutationFn: login,
		onSuccess: ({ access_token }) => logIn(access_token),
	});
}

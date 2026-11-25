import { useMutation } from "@tanstack/react-query";

import { register } from "@/api/auth";
import { useAuth } from "@/components/AuthProvider";

/** Creates an account; the user is logged in afterwards, like after `useLogin`. */
export function useRegister() {
	const { logIn } = useAuth();

	return useMutation({
		mutationFn: register,
		onSuccess: logIn,
	});
}

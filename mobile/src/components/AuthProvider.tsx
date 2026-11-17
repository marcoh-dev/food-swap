import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, use, useCallback, useEffect, useState } from "react";

import { isUnauthorizedError } from "@/api/request";
import { deleteToken, getToken, saveToken } from "@/api/token";

type AuthContextValue = {
	isLoggedIn: boolean;
	logIn: (token: string) => Promise<void>;
	logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [token, setToken] = useState<string | null>();

	useEffect(() => {
		getToken()
			.then(setToken)
			.catch(() => setToken(null));
	}, []);

	const logOut = useCallback(async () => {
		await deleteToken();
		setToken(null);
		await queryClient.resetQueries();
	}, [queryClient]);

	useEffect(
		() =>
			queryClient.getQueryCache().subscribe((event) => {
				if (
					event.type === "updated" &&
					event.action.type === "error" &&
					isUnauthorizedError(event.action.error)
				) {
					void logOut();
				}
			}),
		[queryClient, logOut],
	);

	async function logIn(newToken: string) {
		await saveToken(newToken);
		setToken(newToken);
	}

	if (token === undefined) {
		return null;
	}

	return (
		<AuthContext value={{ isLoggedIn: token !== null, logIn, logOut }}>{children}</AuthContext>
	);
}

export function useAuth() {
	const context = use(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used inside AuthProvider");
	}

	return context;
}

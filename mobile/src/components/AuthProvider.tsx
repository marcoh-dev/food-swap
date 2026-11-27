import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, use, useCallback, useEffect, useState } from "react";

import { logout } from "@/api/auth";
import { isUnauthorizedError } from "@/api/request";
import { type AuthTokens, deleteTokens, getRefreshToken, getToken, saveTokens } from "@/api/token";
import { clearChatDrafts } from "@/lib/chatDrafts";
import { registerForPush, unregisterFromPush } from "@/lib/pushNotifications";

type AuthContextValue = {
	isLoggedIn: boolean;
	logIn: (tokens: AuthTokens) => Promise<void>;
	logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [token, setToken] = useState<string | null>();
	const isLoggedIn = Boolean(token);

	useEffect(() => {
		getToken()
			.then(setToken)
			.catch(() => setToken(null));
	}, []);

	// On app start and after login; renews this device's push token
	useEffect(() => {
		if (isLoggedIn) void registerForPush();
	}, [isLoggedIn]);

	const logOut = useCallback(async () => {
		// First, while the request can still be authorised
		await unregisterFromPush();
		const refreshToken = await getRefreshToken();
		await deleteTokens();
		setToken(null);
		await queryClient.resetQueries();
		clearChatDrafts();

		// Not awaited and errors ignored: the user is logged out either way, the token expires later
		if (refreshToken) void logout(refreshToken).catch(() => undefined);
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

	async function logIn(tokens: AuthTokens) {
		await saveTokens(tokens);
		setToken(tokens.access_token);
	}

	if (token === undefined) {
		return null;
	}

	return <AuthContext value={{ isLoggedIn, logIn, logOut }}>{children}</AuthContext>;
}

export function useAuth() {
	const context = use(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used inside AuthProvider");
	}

	return context;
}

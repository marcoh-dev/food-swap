import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, use, useEffect, useState } from "react";

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

	async function logIn(newToken: string) {
		await saveToken(newToken);
		setToken(newToken);
	}

	async function logOut() {
		await deleteToken();
		setToken(null);
		await queryClient.resetQueries();
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

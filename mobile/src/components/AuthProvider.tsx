import { createContext, type ReactNode, use, useEffect, useState } from "react";

import { getToken, saveToken } from "@/api/token";

type AuthContextValue = {
	isLoggedIn: boolean;
	logIn: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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

	if (token === undefined) {
		return null;
	}

	return <AuthContext value={{ isLoggedIn: token !== null, logIn }}>{children}</AuthContext>;
}

export function useAuth() {
	const context = use(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used inside AuthProvider");
	}

	return context;
}

import { Redirect } from "expo-router";
import type { ReactNode } from "react";

import { useAuth } from "@/components/AuthProvider";
import { HOME_ROUTE } from "@/lib/routes";

export function RequireLogin({ children }: { children: ReactNode }) {
	const { isLoggedIn } = useAuth();

	if (!isLoggedIn) {
		return <Redirect href={HOME_ROUTE} />;
	}

	return children;
}

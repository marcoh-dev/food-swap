"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

// Like in the app: data counts as up to date for 5 minutes, then it reloads when it's used again
const STALE_TIME = 5 * 60 * 1000;

/**
 * Provides the TanStack Query cache to client components. One cache per browser tab; it's created
 * in the component, so the server never shares it between users.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: STALE_TIME,
						// The server actions already return texts for users; the screens offer to try again
						retry: false,
					},
				},
			}),
	);

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

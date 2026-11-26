import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuth } from "@/components/AuthProvider";
import { connectChatSocket } from "@/lib/chatSocket";

/**
 * Keeps the chat socket connected while the user is logged in, like `ChatSocketConnector` on the
 * web; logs out when the server ends the session.
 */
export function ChatSocketConnector() {
	const queryClient = useQueryClient();
	const { isLoggedIn, logOut } = useAuth();

	useEffect(() => {
		if (!isLoggedIn) return;

		return connectChatSocket(queryClient, () => void logOut());
	}, [isLoggedIn, queryClient, logOut]);

	return null;
}

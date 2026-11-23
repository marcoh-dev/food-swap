import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sendReply } from "@/api/chats";
import { addMessageToCache } from "@/lib/chatCache";

export function useSendReply(chatId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (content: string) => sendReply(chatId, content),
		// Own messages are never unread
		onSuccess: (message) => addMessageToCache(queryClient, message, { unread: false }),
	});
}

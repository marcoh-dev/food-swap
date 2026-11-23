import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sendReply } from "@/api/chats";
import { addMessageToCache } from "@/lib/chatCache";
import { setChatDraft } from "@/lib/chatDrafts";

export function useSendReply(chatId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (content: string) => sendReply(chatId, content),
		onSuccess: (message) => {
			// Own messages are never unread
			addMessageToCache(queryClient, message, { unread: false });
			// Here and not in the reply bar, so it also happens if the user left the chat meanwhile
			setChatDraft(chatId, "");
		},
	});
}

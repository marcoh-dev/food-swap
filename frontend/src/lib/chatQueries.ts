import {
	addMessageToCache,
	CHAT_LIST_QUERY_KEY,
	chatQueryKey,
	isChatInCache,
	removeChatFromCache,
	setChatUnreadInCache,
	UNREAD_CHATS_COUNT_QUERY_KEY,
} from "@food-swap/shared/chat-cache";
import { type QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	deleteChatAction,
	getChatAction,
	getChatsAction,
	getUnreadChatsCountAction,
	markChatReadAction,
	replyToChatAction,
	startChatAction,
} from "@/app/chats/actions";
import { fromAction } from "@/lib/fromAction";
import { useChatStore } from "@/store/chat.store";

/** The chat list of the logged-in user, newest message first. */
export function useChats() {
	return useQuery({
		queryKey: CHAT_LIST_QUERY_KEY,
		queryFn: () => fromAction(getChatsAction()),
	});
}

/** Number of chats with unread messages (badge and tab title); 0 while logged out. */
export function useUnreadChatsCount() {
	const isLoggedIn = useChatStore((state) => state.userId !== null);

	return useQuery({
		queryKey: UNREAD_CHATS_COUNT_QUERY_KEY,
		queryFn: () => fromAction(getUnreadChatsCountAction()),
		enabled: isLoggedIn,
	});
}

/** One chat with its messages, oldest first; pass `enabled: false` for a chat that was deleted. */
export function useChat(chatId: string, { enabled = true } = {}) {
	return useQuery({
		queryKey: chatQueryKey(chatId),
		queryFn: () => fromAction(getChatAction(chatId)),
		enabled,
	});
}

/** Sends the first message about a listing; continues the chat if the user deleted it earlier. */
export function useStartChat() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ listingId, content }: { listingId: string; content: string }) =>
			fromAction(startChatAction(listingId, content)),
		onSuccess: (message) => {
			const inList = isChatInCache(queryClient, message.chatId);
			addMessageToCache(queryClient, message, { unread: false });
			// A new or continued chat isn't in the list yet
			if (!inList) void queryClient.invalidateQueries({ queryKey: CHAT_LIST_QUERY_KEY });
		},
	});
}

export function useSendReply(chatId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (content: string) => fromAction(replyToChatAction(chatId, content)),
		// Own messages are never unread
		onSuccess: (message) => addMessageToCache(queryClient, message, { unread: false }),
	});
}

/** Hides the chat for the current user; the other person keeps it. */
export function useDeleteChat() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (chatId: string) => fromAction(deleteChatAction(chatId)),
		onSuccess: (_result, chatId) => {
			removeChatFromCache(queryClient, chatId);
			void queryClient.invalidateQueries({ queryKey: UNREAD_CHATS_COUNT_QUERY_KEY });
		},
	});
}

/**
 * Marks a chat as read and updates the list and the unread count. On an error the chat stays
 * unread until it's opened again.
 */
export async function markChatRead(queryClient: QueryClient, chatId: string) {
	try {
		await fromAction(markChatReadAction(chatId));
	} catch {
		return;
	}

	setChatUnreadInCache(queryClient, chatId, false);
	void queryClient.invalidateQueries({ queryKey: UNREAD_CHATS_COUNT_QUERY_KEY });
}

/** For forms that show an error text: waits for a mutation and returns its error text or `null`. */
export async function errorTextOf(mutation: Promise<unknown>): Promise<string | null> {
	try {
		await mutation;
		return null;
	} catch (error) {
		return error instanceof Error ? error.message : "Etwas ist schiefgelaufen.";
	}
}

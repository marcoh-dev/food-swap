import type {
	ChatDetail,
	ChatListItem,
	ChatMessage,
	ListingChatStatus,
	SocketTicketResponse,
} from "@food-swap/shared/types";

import { get, post, postWithoutResponse } from "@/api/request";

/** Prefix of all chat queries, e.g. to refetch everything after the socket reconnected. */
export const CHATS_QUERY_KEY = ["chats"];
export const CHAT_LIST_QUERY_KEY = [...CHATS_QUERY_KEY, "list"];
export const UNREAD_CHATS_COUNT_QUERY_KEY = [...CHATS_QUERY_KEY, "unread-count"];

export function chatQueryKey(chatId: string) {
	return [...CHATS_QUERY_KEY, "detail", chatId];
}

/** Whether the current user already has a chat about a listing (for the listing detail). */
export function listingChatQueryKey(listingId: string) {
	return [...CHATS_QUERY_KEY, "listing", listingId];
}

export function fetchChats(signal: AbortSignal) {
	return get<ChatListItem[]>("/chats", signal);
}

export async function fetchUnreadChatsCount(signal: AbortSignal) {
	const { count } = await get<{ count: number }>("/chats/unread-count", signal);
	return count;
}

export function fetchChat(chatId: string, signal: AbortSignal) {
	return get<ChatDetail>(`/chats/${chatId}`, signal);
}

export function fetchListingChat(listingId: string, signal: AbortSignal) {
	return get<ListingChatStatus>(`/chats/listing/${listingId}`, signal);
}

/** Sends the first message about a listing; continues the chat if the user deleted it earlier. */
export function startChat(listingId: string, content: string) {
	return post<ChatMessage>("/chats", { listingId, content });
}

export function sendReply(chatId: string, content: string) {
	return post<ChatMessage>(`/chats/${chatId}/messages`, { content });
}

export function markChatRead(chatId: string) {
	return postWithoutResponse(`/chats/${chatId}/read`, {});
}

/** A short-lived ticket for connecting to the chat socket (the socket never gets the login token). */
export function fetchSocketTicket() {
	return post<SocketTicketResponse>("/chats/socket-ticket", {});
}

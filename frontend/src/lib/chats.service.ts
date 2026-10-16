import type { ChatDetail, ChatListItem, ChatMessage, ListingChatStatus } from "./types/chat.types";
import { fetchAPI } from "./fetchAPI";

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		message: string,
	) {
		super(message);
	}
}

async function throwIfFailed(response: Response): Promise<void> {
	if (response.ok) return;

	const body = await response.json().catch(() => null);
	const message = Array.isArray(body?.message) ? body.message[0] : body?.message;

	throw new ApiError(response.status, message ?? response.statusText);
}

export async function getChats(): Promise<ChatListItem[]> {
	const response = await fetchAPI(process.env.NEXT_PUBLIC_FOODSWAP_API_URL + "/chats", {
		cache: "no-store",
	});
	await throwIfFailed(response);
	return response.json();
}

export async function getChat(chatId: string): Promise<ChatDetail> {
	const response = await fetchAPI(process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/chats/${chatId}`, {
		cache: "no-store",
	});
	await throwIfFailed(response);
	return response.json();
}

export async function getListingChatStatus(listingId: string): Promise<ListingChatStatus> {
	const response = await fetchAPI(
		process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/chats/listing/${listingId}`,
		{ cache: "no-store" },
	);
	await throwIfFailed(response);
	return response.json();
}

export async function startChat(listingId: string, content: string): Promise<ChatMessage> {
	const response = await fetchAPI(process.env.NEXT_PUBLIC_FOODSWAP_API_URL + "/chats", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ listingId, content }),
	});
	await throwIfFailed(response);
	return response.json();
}

export async function replyToChat(chatId: string, content: string): Promise<ChatMessage> {
	const response = await fetchAPI(
		process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/chats/${chatId}/messages`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ content }),
		},
	);
	await throwIfFailed(response);
	return response.json();
}

export async function deleteChat(chatId: string): Promise<void> {
	const response = await fetchAPI(process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/chats/${chatId}`, {
		method: "DELETE",
	});
	await throwIfFailed(response);
}

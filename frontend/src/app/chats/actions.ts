"use server";

import type { ChatDetail, ChatListItem, ChatMessage } from "@food-swap/shared/types";
import { z } from "zod";

import {
	ApiError,
	deleteChat,
	getChat,
	getChats,
	getUnreadChatsCount,
	markChatRead,
	replyToChat,
	startChat,
} from "@/lib/chats.service";
import type { ActionResult } from "@/lib/types/common.types";

// The backend's texts for 400, 403 and 404 are written for users; other errors get the action's fallback
function chatErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof ApiError) {
		if (error.status === 401) {
			return "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.";
		}

		if ([400, 403, 404].includes(error.status)) {
			return error.message;
		}
	}
	return fallback;
}

export async function getChatsAction(): Promise<ActionResult<ChatListItem[]>> {
	try {
		return { data: await getChats() };
	} catch (error) {
		return {
			error: chatErrorMessage(
				error,
				"Deine Chats konnten nicht geladen werden. Versuche es nochmal.",
			),
		};
	}
}

export async function getUnreadChatsCountAction(): Promise<ActionResult<number>> {
	try {
		return { data: await getUnreadChatsCount() };
	} catch (error) {
		return {
			error: chatErrorMessage(
				error,
				"Ungelesene Chats konnten nicht geladen werden. Versuche es nochmal.",
			),
		};
	}
}

export async function getChatAction(chatId: string): Promise<ActionResult<ChatDetail>> {
	// The chat id comes from the URL; the backend would answer an invalid one with an English 400
	if (!z.uuid().safeParse(chatId).success) return { error: "Chat nicht gefunden" };

	try {
		return { data: await getChat(chatId) };
	} catch (error) {
		return {
			error: chatErrorMessage(
				error,
				"Dieser Chat konnte nicht geladen werden. Versuche es nochmal.",
			),
		};
	}
}

export async function startChatAction(
	listingId: string,
	content: string,
): Promise<ActionResult<ChatMessage>> {
	try {
		return { data: await startChat(listingId, content) };
	} catch (error) {
		return {
			error: chatErrorMessage(
				error,
				"Die Nachricht konnte nicht gesendet werden. Versuche es nochmal.",
			),
		};
	}
}

export async function replyToChatAction(
	chatId: string,
	content: string,
): Promise<ActionResult<ChatMessage>> {
	try {
		return { data: await replyToChat(chatId, content) };
	} catch (error) {
		return {
			error: chatErrorMessage(
				error,
				"Die Nachricht konnte nicht gesendet werden. Versuche es nochmal.",
			),
		};
	}
}

export async function markChatReadAction(chatId: string): Promise<ActionResult<null>> {
	try {
		await markChatRead(chatId);
		return { data: null };
	} catch (error) {
		return {
			error: chatErrorMessage(
				error,
				"Der Chat konnte nicht als gelesen markiert werden. Versuche es nochmal.",
			),
		};
	}
}

export async function deleteChatAction(chatId: string): Promise<ActionResult<null>> {
	try {
		await deleteChat(chatId);
		return { data: null };
	} catch (error) {
		return {
			error: chatErrorMessage(
				error,
				"Der Chat konnte nicht gelöscht werden. Versuche es nochmal.",
			),
		};
	}
}

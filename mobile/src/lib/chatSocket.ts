import {
	addMessageToCache,
	CHAT_LIST_QUERY_KEY,
	chatQueryKey,
	CHATS_QUERY_KEY,
	isChatInCache,
	removeChatFromCache,
	setChatUnreadInCache,
	UNREAD_CHATS_COUNT_QUERY_KEY,
} from "@food-swap/shared/chat-cache";
import type { ChatMessage, ServerToClientEvents } from "@food-swap/shared/types";
import type { QueryClient } from "@tanstack/react-query";
import { AppState } from "react-native";
import { io, type Socket } from "socket.io-client";

import { CURRENT_USER_QUERY_KEY, fetchCurrentUser } from "@/api/auth";
import { fetchSocketTicket, LISTING_CHATS_QUERY_KEY } from "@/api/chats";
import { isUnauthorizedError } from "@/api/request";
import { getEnv } from "@/env";

/**
 * Connects the chat socket and updates the cached chat queries with its events. The socket is
 * only connected while the app is in the foreground; after every reconnect the chats are
 * reloaded, because events may have been missed meanwhile. Returns a function that disconnects.
 */
export function connectChatSocket(queryClient: QueryClient, onSessionEnded: () => void) {
	const socket: Socket<ServerToClientEvents> = io(getEnv().EXPO_PUBLIC_API_URL, {
		autoConnect: false,
		// Skips starting with HTTP long polling, which only helps browsers that block WebSockets
		transports: ["websocket"],
	});

	let connectedBefore = false;
	let ticketFailed = false;
	let sessionEnded = false;

	function setUnread(chatId: string, unread: boolean) {
		setChatUnreadInCache(queryClient, chatId, unread);
		// The backend knows how many chats are still unread
		void queryClient.invalidateQueries({ queryKey: UNREAD_CHATS_COUNT_QUERY_KEY });
	}

	async function onNewMessage(message: ChatMessage) {
		try {
			const user = await queryClient.ensureQueryData({
				queryKey: CURRENT_USER_QUERY_KEY,
				queryFn: ({ signal }) => fetchCurrentUser(signal),
			});
			const fromOthers = message.senderId !== user.id;
			const inList = isChatInCache(queryClient, message.chatId);

			addMessageToCache(queryClient, message, { unread: fromOthers });
			// A new chat, or one the user deleted and the other person wrote again, isn't in the list
			// yet; a listing's message card should then link to it instead of offering to continue it
			if (!inList) {
				void queryClient.invalidateQueries({ queryKey: CHAT_LIST_QUERY_KEY });
				void queryClient.invalidateQueries({ queryKey: LISTING_CHATS_QUERY_KEY });
			}
			if (fromOthers) {
				void queryClient.invalidateQueries({ queryKey: UNREAD_CHATS_COUNT_QUERY_KEY });
			}
		} catch {
			void queryClient.invalidateQueries({ queryKey: CHATS_QUERY_KEY });
		}
	}

	function onChatRemoved({ chatId }: { chatId: string }) {
		removeChatFromCache(queryClient, chatId);
		void queryClient.invalidateQueries({ queryKey: UNREAD_CHATS_COUNT_QUERY_KEY });
		// An open conversation reloads and shows "Chat nicht gefunden"
		void queryClient.invalidateQueries({ queryKey: chatQueryKey(chatId) });
		// A listing's message card offers to continue the chat (the event doesn't say which listing)
		void queryClient.invalidateQueries({ queryKey: LISTING_CHATS_QUERY_KEY });
	}

	function onConnect() {
		if (connectedBefore) void queryClient.invalidateQueries({ queryKey: CHATS_QUERY_KEY });
		connectedBefore = true;
	}

	function onDisconnect(reason: string) {
		// The server ends a connection itself when the ticket is missing or invalid. Unless getting
		// the ticket failed for another reason (e.g. a server error), the login is no longer valid,
		// e.g. after "log out everywhere" on another device. Only once, so it can't loop.
		if (reason === "io server disconnect" && !ticketFailed && !sessionEnded) {
			sessionEnded = true;
			onSessionEnded();
		}
	}

	// A fresh ticket for every connection attempt, so reconnects work after the old one expired.
	// The request renews the login token if needed; if that fails, the server rejects the
	// connection and the user is logged out.
	socket.auth = (send) => {
		ticketFailed = false;
		fetchSocketTicket()
			.then(({ ticket }) => send({ ticket }))
			.catch((error: unknown) => {
				ticketFailed = !isUnauthorizedError(error);
				send({});
			});
	};

	socket.on("connect", onConnect);
	socket.on("disconnect", onDisconnect);
	socket.on("newMessage", (message) => void onNewMessage(message));
	socket.on("chatRead", ({ chatId }) => setUnread(chatId, false));
	socket.on("chatRemoved", onChatRemoved);

	// Without push notifications (#176), a connection in the background has no use. Only
	// "background" disconnects: iOS is briefly "inactive", e.g. for Control Center or the app switcher
	const subscription = AppState.addEventListener("change", (state) => {
		if (state === "active") {
			socket.connect();
		} else if (state === "background") {
			socket.disconnect();
		}
	});
	if (AppState.currentState !== "background") socket.connect();

	return () => {
		subscription.remove();
		socket.disconnect();
	};
}

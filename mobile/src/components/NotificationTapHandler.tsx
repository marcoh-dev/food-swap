import {
	addNotificationResponseReceivedListener,
	clearLastNotificationResponse,
	getLastNotificationResponse,
	type NotificationResponse,
} from "expo-notifications";
import { router, usePathname } from "expo-router";
import { useCallback, useEffect, useRef } from "react";

/**
 * Opens the chat of a tapped push notification, also when the tap started the app. Render it
 * after the navigator, so the app can navigate when this runs.
 */
export function NotificationTapHandler() {
	const pathname = usePathname();
	// The listener is added once; it reads the current screen from here
	const pathnameRef = useRef(pathname);
	const pendingChatId = useRef<string | null>(null);
	// The tap that started the app can arrive twice: as the last response and through the listener
	const handledNotificationId = useRef<string | null>(null);

	const openPendingChat = useCallback(() => {
		const chatId = pendingChatId.current;
		// On start, the app first shows "/", which redirects to the first tab; opening the chat
		// before that would be replaced by the redirect
		if (!chatId || pathnameRef.current === "/") return;

		pendingChatId.current = null;
		// Already open when the app went to the background: not a second time
		if (pathnameRef.current === `/chats/${chatId}`) return;
		router.push({ pathname: "/chats/[id]", params: { id: chatId } });
	}, []);

	useEffect(() => {
		pathnameRef.current = pathname;
		openPendingChat();
	}, [pathname, openPendingChat]);

	useEffect(() => {
		function handleTap(response: NotificationResponse) {
			const { identifier, content } = response.notification.request;
			if (identifier === handledNotificationId.current) return;
			handledNotificationId.current = identifier;

			// The backend sends { chatId } with each chat push
			const chatId = content.data?.chatId;
			if (typeof chatId !== "string") return;

			pendingChatId.current = chatId;
			openPendingChat();
		}

		// The tap that started the app; cleared, so a reload doesn't open it again
		const launchResponse = getLastNotificationResponse();
		if (launchResponse) {
			clearLastNotificationResponse();
			handleTap(launchResponse);
		}

		const subscription = addNotificationResponseReceivedListener(handleTap);
		return () => subscription.remove();
	}, [openPendingChat]);

	return null;
}

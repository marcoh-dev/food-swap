import {
	addNotificationResponseReceivedListener,
	clearLastNotificationResponse,
	getLastNotificationResponse,
	type NotificationResponse,
} from "expo-notifications";
import { router, usePathname } from "expo-router";
import { useEffect, useRef } from "react";

/**
 * Opens the chat of a tapped push notification, also when the tap started the app. Render it
 * after the navigator, so the app can navigate when this runs.
 */
export function NotificationTapHandler() {
	const pathname = usePathname();
	// The listener is added once; it reads the current screen from here
	const pathnameRef = useRef(pathname);

	useEffect(() => {
		pathnameRef.current = pathname;
	}, [pathname]);

	useEffect(() => {
		function openChat(response: NotificationResponse) {
			// The backend sends { chatId } with each chat push
			const chatId = response.notification.request.content.data?.chatId;
			if (typeof chatId !== "string") return;

			// Already open when the app went to the background: not a second time
			if (pathnameRef.current === `/chats/${chatId}`) return;
			router.push({ pathname: "/chats/[id]", params: { id: chatId } });
		}

		// The tap that started the app; cleared, so a reload doesn't open it again
		const launchResponse = getLastNotificationResponse();
		if (launchResponse) {
			clearLastNotificationResponse();
			openChat(launchResponse);
		}

		const subscription = addNotificationResponseReceivedListener(openChat);
		return () => subscription.remove();
	}, []);

	return null;
}

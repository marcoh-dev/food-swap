import {
	AndroidImportance,
	setNotificationChannelAsync,
	setNotificationHandler,
} from "expo-notifications";
import { Platform } from "react-native";

/**
 * The Android notification channel for chat messages. The backend sends pushes to this channel
 * (CHAT_CHANNEL_ID in backend/src/push/push.service.ts); keep both the same.
 */
export const CHAT_CHANNEL_ID = "chat-messages";

/**
 * Sets up notifications once at app start: the Android channel "Chat-Nachrichten" (Android only
 * asks for the notification permission once a channel exists), and no notifications while the
 * app is in the foreground: the chat updates live there, and the tab badge shows unread chats.
 */
export function setUpNotifications() {
	setNotificationHandler({
		handleNotification: () =>
			Promise.resolve({
				shouldShowBanner: false,
				shouldShowList: false,
				shouldPlaySound: false,
				shouldSetBadge: false,
			}),
	});

	if (Platform.OS === "android") {
		void setNotificationChannelAsync(CHAT_CHANNEL_ID, {
			name: "Chat-Nachrichten",
			importance: AndroidImportance.HIGH,
		});
	}
}

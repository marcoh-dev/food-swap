import Constants from "expo-constants";
import {
	AndroidImportance,
	getExpoPushTokenAsync,
	getPermissionsAsync,
	PermissionStatus,
	requestPermissionsAsync,
	setNotificationChannelAsync,
	setNotificationHandler,
} from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Alert, Platform } from "react-native";

import { deletePushToken, savePushToken } from "@/api/push";

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

// Whether the app already asked for permission (once, after the first sent message)
const ASKED_KEY = "push_permission_asked";

// The token saved for the logged-in user, so logout can remove it without asking Expo again
let savedToken: string | null = null;

/**
 * Saves this device's push token for the logged-in user, or renews it (the backend keeps tokens
 * that are renewed within the login lifetime). Does nothing without permission; errors are only
 * logged, the app works without push.
 */
export async function registerForPush() {
	try {
		const { granted } = await getPermissionsAsync();
		if (!granted) return;

		const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
		const { data: token } = await getExpoPushTokenAsync({ projectId });
		await savePushToken(token);
		savedToken = token;
	} catch (error) {
		console.warn("Push notifications could not be set up.", error);
	}
}

/**
 * Removes this device's push token from the logged-in user. Called before logging out, while the
 * request can still be authorised. Errors are ignored: after "Überall abmelden" or deleting the
 * account the backend already removed it.
 */
export async function unregisterFromPush() {
	if (!savedToken) return;

	const token = savedToken;
	savedToken = null;
	await deletePushToken(token).catch(() => undefined);
}

function confirmAsking() {
	return new Promise<boolean>((resolve) => {
		Alert.alert(
			"Benachrichtigungen aktivieren?",
			"Erfahre sofort, wenn dir jemand schreibt. Du kannst das jederzeit in den Android-Einstellungen ändern.",
			[
				{ text: "Später", style: "cancel", onPress: () => resolve(false) },
				{ text: "Aktivieren", onPress: () => resolve(true) },
			],
			// Closing the alert with the back button counts as "Später"
			{ cancelable: true, onDismiss: () => resolve(false) },
		);
	});
}

/**
 * Asks once for the notification permission, after the user sent a message: first with a short
 * explanation, then with the system dialog. Not again after "Später" or a denial; it can be turned
 * on in the system settings.
 */
export async function askForPushPermission() {
	try {
		const { status, canAskAgain } = await getPermissionsAsync();
		if (status !== PermissionStatus.UNDETERMINED || !canAskAgain) return;
		if (await SecureStore.getItemAsync(ASKED_KEY)) return;

		await SecureStore.setItemAsync(ASKED_KEY, "true");
		if (!(await confirmAsking())) return;

		const { granted } = await requestPermissionsAsync();
		if (granted) await registerForPush();
	} catch (error) {
		console.warn("Notification permission could not be requested.", error);
	}
}

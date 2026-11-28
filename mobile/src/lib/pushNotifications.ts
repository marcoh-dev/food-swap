import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
import {
	AndroidImportance,
	getExpoPushTokenAsync,
	getPermissionsAsync,
	requestPermissionsAsync,
	setNotificationChannelAsync,
	setNotificationHandler,
} from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Alert, Linking, Platform } from "react-native";

import { deletePushToken, savePushToken } from "@/api/push";

/**
 * Whether the app offers push notifications: only in FoodSwap's own Android builds. Expo Go can't
 * get push tokens on Android, and iOS isn't set up yet (#176).
 */
export const PUSH_SUPPORTED = Platform.OS === "android" && !isRunningInExpoGo();

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

	// Only needed for push; Expo Go on Android rejects creating it
	if (PUSH_SUPPORTED) {
		setNotificationChannelAsync(CHAT_CHANNEL_ID, {
			name: "Chat-Nachrichten",
			importance: AndroidImportance.HIGH,
		}).catch((error: unknown) => {
			console.warn("The notification channel could not be created.", error);
		});
	}
}

// Whether the app already asked for permission (once, after the first sent message)
const ASKED_KEY = "push_permission_asked";

// The token saved for the logged-in user. Stored, because Android restarts the app when
// notifications are turned off, and the app must still know which token to remove then.
const TOKEN_KEY = "push_token";

/**
 * Brings the backend in line with the permission: with notifications allowed, saves this device's
 * push token for the logged-in user or renews it (the backend keeps tokens renewed within the
 * login lifetime); without, removes the token saved before. Errors are only logged, the app works
 * without push, and the next call tries again.
 */
export async function syncPushToken() {
	if (!PUSH_SUPPORTED) return;

	try {
		const { granted } = await getPermissionsAsync();
		if (!granted) {
			await unregisterFromPush();
			return;
		}

		const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
		const { data: token } = await getExpoPushTokenAsync({ projectId });
		await savePushToken(token);
		await SecureStore.setItemAsync(TOKEN_KEY, token);
	} catch (error) {
		console.warn("Push notifications could not be updated.", error);
	}
}

/**
 * Removes this device's push token from the logged-in user; also called before logging out, while
 * the request can still be authorised. Errors are ignored: the token stays stored, so the next
 * sync tries again; after "Überall abmelden" or deleting the account the backend already removed
 * it, and the daily cleanup removes forgotten ones.
 */
export async function unregisterFromPush() {
	const token = await SecureStore.getItemAsync(TOKEN_KEY);
	if (!token) return;

	try {
		await deletePushToken(token);
		await SecureStore.deleteItemAsync(TOKEN_KEY);
	} catch {
		// Kept for the next try
	}
}

function confirmAsking() {
	return new Promise<boolean>((resolve) => {
		Alert.alert(
			"Benachrichtigungen aktivieren?",
			"Erfahre sofort, wenn dir jemand schreibt. Du kannst das jederzeit in deinem Profil ändern.",
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
 * on from the profile.
 */
export async function askForPushPermission() {
	if (!PUSH_SUPPORTED) return;

	try {
		const current = await getPermissionsAsync();
		if (current.granted || !current.canAskAgain) return;
		if (await SecureStore.getItemAsync(ASKED_KEY)) return;

		await SecureStore.setItemAsync(ASKED_KEY, "true");
		if (!(await confirmAsking())) return;

		const { granted } = await requestPermissionsAsync();
		if (granted) await syncPushToken();
	} catch (error) {
		console.warn("Notification permission could not be requested.", error);
	}
}

/** Whether notifications are allowed for the app. */
export async function notificationsAllowed() {
	const { granted } = await getPermissionsAsync();
	return granted;
}

// FoodSwap's notification settings in Android; the app info page if a device doesn't have them
async function openNotificationSettings() {
	try {
		await Linking.sendIntent("android.settings.APP_NOTIFICATION_SETTINGS", [
			{
				key: "android.provider.extra.APP_PACKAGE",
				value: Constants.expoConfig?.android?.package ?? "",
			},
		]);
	} catch {
		await Linking.openSettings();
	}
}

/**
 * Lets the user turn notifications on or off from the profile: the system dialog while they're off
 * and Android can still ask (no explanation first, the user chose this), otherwise the system
 * settings.
 */
export async function changeNotificationSettings() {
	try {
		const current = await getPermissionsAsync();
		if (!current.granted && current.canAskAgain) {
			await SecureStore.setItemAsync(ASKED_KEY, "true");
			const { granted } = await requestPermissionsAsync();
			if (granted) await syncPushToken();
			return;
		}

		await openNotificationSettings();
	} catch (error) {
		console.warn("Notification settings could not be opened.", error);
	}
}

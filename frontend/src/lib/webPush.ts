import { deletePushSubscriptionAction, savePushSubscriptionAction } from "@/app/actions";
import type { WebPushSubscription } from "@/lib/push.service";

import { notificationsEnabled } from "./notifications";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const SERVICE_WORKER_URL = "/sw.js";

/** Whether this browser can get web push, and the web knows the backend's public key. */
export function pushSupported(): boolean {
	return (
		typeof window !== "undefined" &&
		"serviceWorker" in navigator &&
		"PushManager" in window &&
		Boolean(VAPID_PUBLIC_KEY)
	);
}

// The key as bytes: every browser accepts this form, not all accept the base64url text
function keyBytes(base64Url: string): Uint8Array<ArrayBuffer> {
	const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
	return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

/** This browser's push subscription, if it has one. */
export async function currentPushSubscription(): Promise<PushSubscription | null> {
	if (!pushSupported()) return null;

	const registration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL);
	return (await registration?.pushManager.getSubscription()) ?? null;
}

/**
 * Subscribes this browser to push and saves the subscription for the logged-in user, or renews an
 * existing one. Does nothing without push support, permission or with notifications turned off;
 * errors are ignored, the in-tab notifications still work then.
 */
export async function subscribeToPush(): Promise<void> {
	if (!pushSupported() || !VAPID_PUBLIC_KEY || !notificationsEnabled()) return;

	try {
		const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL);
		const subscription =
			(await registration.pushManager.getSubscription()) ??
			(await registration.pushManager.subscribe({
				// Browsers require that every push shows a notification
				userVisibleOnly: true,
				applicationServerKey: keyBytes(VAPID_PUBLIC_KEY),
			}));

		await savePushSubscriptionAction(subscription.toJSON() as WebPushSubscription);
	} catch (error) {
		console.warn("Web push could not be set up.", error);
	}
}

/**
 * Ends this browser's push subscription: on the backend (while still logged in) and in the
 * browser. Used when notifications are turned off and before logging out.
 */
export async function unsubscribeFromPush(): Promise<void> {
	try {
		const subscription = await currentPushSubscription();
		if (!subscription) return;

		await deletePushSubscriptionAction(subscription.endpoint);
		await subscription.unsubscribe();
	} catch (error) {
		console.warn("Web push could not be ended.", error);
	}
}

import { del, postWithoutResponse } from "@/api/request";

/** Saves this device's Expo push token for the logged-in user, or renews it. */
export function savePushToken(token: string) {
	return postWithoutResponse("/push-subscriptions", { type: "expo", endpoint: token });
}

/** Removes this device's Expo push token from the logged-in user. */
export function deletePushToken(token: string) {
	return del("/push-subscriptions", { endpoint: token });
}

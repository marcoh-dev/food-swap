const PROMPT_DISMISSED_KEY = "foodswap:notification-prompt-dismissed";
const TURNED_OFF_KEY = "foodswap:notifications-off";

export const PERMISSION_TOAST_ID = "notification-permission";

export function notificationsSupported(): boolean {
	return typeof window !== "undefined" && "Notification" in window;
}

export function notificationsTurnedOff(): boolean {
	try {
		return localStorage.getItem(TURNED_OFF_KEY) !== null;
	} catch {
		return false;
	}
}

export function setNotificationsTurnedOff(off: boolean): void {
	try {
		if (off) localStorage.setItem(TURNED_OFF_KEY, "true");
		else localStorage.removeItem(TURNED_OFF_KEY);
	} catch {
		// Without storage the setting falls back to the browser permission.
	}
}

export function notificationsEnabled(): boolean {
	return (
		notificationsSupported() &&
		Notification.permission === "granted" &&
		!notificationsTurnedOff()
	);
}

export function shouldAskForPermission(): boolean {
	if (!notificationsSupported() || Notification.permission !== "default") return false;

	try {
		return localStorage.getItem(PROMPT_DISMISSED_KEY) === null;
	} catch {
		return true;
	}
}

export function dismissPermissionPrompt(): void {
	try {
		localStorage.setItem(PROMPT_DISMISSED_KEY, "true");
	} catch {
		// Without storage the prompt shows again on the next visit.
	}
}

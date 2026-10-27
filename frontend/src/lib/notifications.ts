const PROMPT_DISMISSED_KEY = "foodswap:notification-prompt-dismissed";

export function notificationsSupported(): boolean {
	return typeof window !== "undefined" && "Notification" in window;
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

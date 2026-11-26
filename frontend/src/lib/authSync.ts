// Tabs of the same site share the login cookie, but each tab only learns about a login or logout
// when its page is rendered again. A tab whose user changed tells the others over this channel.
const CHANNEL_NAME = "foodswap:auth";

function openChannel(): BroadcastChannel | null {
	// Not available in every environment, e.g. very old browsers
	return typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CHANNEL_NAME);
}

/** Tells the other tabs who is logged in now in this tab (`null` = nobody). */
export function announceUser(userId: string | null): void {
	const channel = openChannel();
	channel?.postMessage(userId);
	channel?.close();
}

/**
 * Calls `onOtherUser` when another tab announces a different user than `userId`, i.e. this tab
 * shows an outdated login. Returns a function that stops listening.
 */
export function watchOtherTabs(userId: string | null, onOtherUser: () => void): () => void {
	const channel = openChannel();
	if (!channel) return () => {};

	channel.onmessage = (event: MessageEvent<string | null>) => {
		if (event.data !== userId) onOtherUser();
	};

	return () => channel.close();
}

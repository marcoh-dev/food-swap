// FoodSwap's service worker for web push (#112). The browser wakes it up for each push, even
// when no FoodSwap tab is open, and it shows the notification. Plain JavaScript in public/, so
// the browser can load it as /sw.js; Next.js doesn't bundle it.

// A new version takes over right away, and open tabs come under its control, so a click on a
// notification can navigate them (client.navigate only works for controlled tabs)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

/** The chat's page, the same URL the in-tab notifications open. */
function chatUrl(chatId) {
	return `/chats?chat=${encodeURIComponent(chatId)}`;
}

/** Whether a FoodSwap window shows this chat and is visible, so a notification isn't needed. */
async function isChatOpen(chatId) {
	const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
	return windows.some((client) => {
		const url = new URL(client.url);
		return (
			client.visibilityState === "visible" &&
			url.pathname === "/chats" &&
			url.searchParams.get("chat") === chatId
		);
	});
}

// The backend sends { title, body, chatId } (backend/src/push/pushMessage.ts)
self.addEventListener("push", (event) => {
	const message = event.data?.json();
	if (!message) return;

	event.waitUntil(
		(async () => {
			if (await isChatOpen(message.chatId)) return;

			await self.registration.showNotification(message.title, {
				body: message.body,
				icon: "/icon-192.png",
				// One notification per chat: a new message replaces the older one, and still alerts
				tag: message.chatId,
				renotify: true,
				data: { chatId: message.chatId },
			});
		})(),
	);
});

// Opens the chat: in an open FoodSwap tab if there is one, otherwise in a new window
self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const url = chatUrl(event.notification.data.chatId);

	event.waitUntil(
		(async () => {
			const windows = await self.clients.matchAll({ type: "window" });
			const tab = windows[0];
			if (!tab) {
				await self.clients.openWindow(url);
				return;
			}

			await tab.focus();
			await tab.navigate(url);
		})(),
	);
});

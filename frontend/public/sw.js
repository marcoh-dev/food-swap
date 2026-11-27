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

/** Whether a FoodSwap window is on the chats page (the list or any chat). */
function onChatsPage(client) {
	return new URL(client.url).pathname === "/chats";
}

/** Whether a FoodSwap window shows this chat (visible or not). */
function showsChat(client, chatId) {
	return onChatsPage(client) && new URL(client.url).searchParams.get("chat") === chatId;
}

/** Whether a FoodSwap window shows this chat and is visible, so a notification isn't needed. */
async function isChatOpen(chatId) {
	const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
	return windows.some(
		(client) => client.visibilityState === "visible" && showsChat(client, chatId),
	);
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

// Opens the chat, in this order: a tab that already shows it is only focused; a tab on the chats
// page goes there; otherwise the most recently used FoodSwap tab (matchAll lists them in that
// order), so another page isn't taken over while a chats tab exists; or a new window
self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const { chatId } = event.notification.data;

	event.waitUntil(
		(async () => {
			const windows = await self.clients.matchAll({ type: "window" });

			const chatTab = windows.find((client) => showsChat(client, chatId));
			if (chatTab) {
				await chatTab.focus();
				return;
			}

			const tab = windows.find(onChatsPage) ?? windows[0];
			if (!tab) {
				await self.clients.openWindow(chatUrl(chatId));
				return;
			}

			await tab.focus();
			await tab.navigate(chatUrl(chatId));
		})(),
	);
});

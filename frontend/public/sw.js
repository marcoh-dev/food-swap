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

/** Whether a URL is the chats page (the list or any chat). */
function onChatsPage(url) {
	return new URL(url).pathname === "/chats";
}

/** Whether a URL shows this chat. */
function showsChat(url, chatId) {
	return onChatsPage(url) && new URL(url).searchParams.get("chat") === chatId;
}

// The question a FoodSwap tab answers (WebPushSubscriber); keep both the same
const TAB_STATE_QUESTION = "tab-state";
// Tabs the browser froze or that are still loading may not answer in time
const ANSWER_TIMEOUT_MS = 500;

/**
 * Asks a FoodSwap tab for its current URL and whether it's visible. The tab is asked because its
 * URL here can be outdated: some browsers (e.g. Firefox) don't pass on page changes inside the
 * web app, which happen without loading a new page. Without an answer, the URL known here is
 * used and the tab counts as not visible.
 */
function askTab(client) {
	return new Promise((resolve) => {
		const channel = new MessageChannel();
		const timeout = setTimeout(
			() => resolve({ url: client.url, visible: false }),
			ANSWER_TIMEOUT_MS,
		);
		channel.port1.onmessage = (event) => {
			clearTimeout(timeout);
			resolve(event.data);
		};
		client.postMessage({ type: TAB_STATE_QUESTION }, [channel.port2]);
	});
}

/** The FoodSwap tabs with their current URL and visibility, most recently used first. */
async function tabs(options) {
	const windows = await self.clients.matchAll({ type: "window", ...options });
	const states = await Promise.all(windows.map(askTab));
	return windows.map((client, index) => ({ client, ...states[index] }));
}

// The backend sends { title, body, chatId } (backend/src/push/pushMessage.ts)
self.addEventListener("push", (event) => {
	const message = event.data?.json();
	if (!message) return;

	event.waitUntil(
		(async () => {
			// No notification for a chat the user is looking at
			const open = await tabs({ includeUncontrolled: true });
			if (open.some((tab) => tab.visible && showsChat(tab.url, message.chatId))) return;

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

// Firefox for Android reports success for focusing and navigating tabs from here but does
// neither, and that can't be detected reliably afterwards; opening a new tab works there. If it
// ever learns to switch tabs, this only means a new tab instead of an existing one.
const CANNOT_SWITCH_TABS =
	/Android/.test(self.navigator.userAgent) && /Firefox/.test(self.navigator.userAgent);

// Opens the chat, in this order: a tab that already shows it is only focused; a tab on the chats
// page goes there; otherwise the most recently used FoodSwap tab (matchAll lists them in that
// order), so another page isn't taken over while a chats tab exists; or a new window (always
// where tabs can't be switched)
self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const { chatId } = event.notification.data;

	event.waitUntil(
		(async () => {
			if (CANNOT_SWITCH_TABS) {
				await self.clients.openWindow(chatUrl(chatId));
				return;
			}

			try {
				// Only tabs under this service worker's control can be navigated from here
				const open = await tabs();

				const chatTab = open.find((tab) => showsChat(tab.url, chatId));
				if (chatTab) {
					await chatTab.client.focus();
					return;
				}

				const tab = open.find((candidate) => onChatsPage(candidate.url)) ?? open[0];
				if (!tab) {
					await self.clients.openWindow(chatUrl(chatId));
					return;
				}

				await tab.client.focus();
				await tab.client.navigate(chatUrl(chatId));
			} catch {
				// Some browsers don't fully support focusing or navigating tabs from here; opening
				// the chat in a new tab still gets the user there
				await self.clients.openWindow(chatUrl(chatId));
			}
		})(),
	);
});

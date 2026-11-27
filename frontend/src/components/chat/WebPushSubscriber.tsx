"use client";

import { useEffect } from "react";

import { subscribeToPush } from "@/lib/webPush";

// The question the service worker asks about this tab (public/sw.js); keep both the same
const TAB_STATE_QUESTION = "tab-state";

/**
 * Subscribes this browser to push on each page load while logged in (permission granted and
 * notifications on), which also renews the subscription on the backend. Also tells the service
 * worker this tab's current URL and whether it's visible: it skips notifications for a chat the
 * user is looking at and finds the right tab on a click, and some browsers don't keep it up to
 * date about page changes inside the web app.
 */
export function WebPushSubscriber() {
	useEffect(() => {
		void subscribeToPush();
	}, []);

	useEffect(() => {
		if (!("serviceWorker" in navigator)) return;

		function answer(event: MessageEvent) {
			const data: unknown = event.data;
			if (
				typeof data !== "object" ||
				data === null ||
				!("type" in data) ||
				data.type !== TAB_STATE_QUESTION
			) {
				return;
			}

			event.ports[0]?.postMessage({
				url: window.location.href,
				visible: document.visibilityState === "visible",
			});
		}

		navigator.serviceWorker.addEventListener("message", answer);
		// Some browsers only deliver the service worker's messages after this call
		navigator.serviceWorker.startMessages();
		return () => navigator.serviceWorker.removeEventListener("message", answer);
	}, []);

	return null;
}

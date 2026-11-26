"use client";

import { useEffect } from "react";

import { subscribeToPush } from "@/lib/webPush";

/**
 * Subscribes this browser to push on each page load while logged in (permission granted and
 * notifications on), which also renews the subscription on the backend.
 */
export function WebPushSubscriber() {
	useEffect(() => {
		void subscribeToPush();
	}, []);

	return null;
}

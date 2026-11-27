"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import {
	dismissPermissionPrompt,
	PERMISSION_TOAST_ID,
	setNotificationsTurnedOff,
	shouldAskForPermission,
} from "@/lib/notifications";
import { subscribeToPush } from "@/lib/webPush";

export function NotificationPermissionPrompt() {
	useEffect(() => {
		if (!shouldAskForPermission()) return;

		toast("Benachrichtigungen aktivieren?", {
			id: PERMISSION_TOAST_ID,
			description:
				"Erfahre sofort, wenn dir jemand schreibt. Du kannst das jederzeit in deinem Profil ändern.",
			duration: Infinity,
			action: {
				label: "Aktivieren",
				onClick: async () => {
					const permission = await Notification.requestPermission();
					if (permission === "granted") {
						setNotificationsTurnedOff(false);
						void subscribeToPush();
					}
					// Prompt closed without a choice → treat like "Später"
					if (permission === "default") dismissPermissionPrompt();
				},
			},
			cancel: {
				label: "Später",
				onClick: dismissPermissionPrompt,
			},
		});
	}, []);

	return null;
}

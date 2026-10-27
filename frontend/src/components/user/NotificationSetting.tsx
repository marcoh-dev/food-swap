"use client";

import { useState, useSyncExternalStore } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
	notificationsSupported,
	notificationsTurnedOff,
	setNotificationsTurnedOff,
} from "@/lib/notifications";

type SettingState = { permission: NotificationPermission; off: boolean };

const emptySubscribe = () => () => {};

export function NotificationSetting() {
	const [setting, setSetting] = useState<SettingState | null>(() =>
		notificationsSupported()
			? { permission: Notification.permission, off: notificationsTurnedOff() }
			: null,
	);

	// Permission and storage are only known in the browser → prevents a hydration mismatch
	const isClient = useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false,
	);

	if (!isClient || !setting) return null;

	const { permission, off } = setting;

	async function toggle(checked: boolean) {
		if (!checked) {
			setNotificationsTurnedOff(true);
			setSetting({ permission, off: true });
			return;
		}

		const granted =
			permission === "granted" || (await Notification.requestPermission()) === "granted";
		if (granted) setNotificationsTurnedOff(false);
		setSetting({ permission: granted ? "granted" : Notification.permission, off: !granted });
	}

	return (
		<Field orientation="horizontal">
			<Checkbox
				id="notifications"
				checked={permission === "granted" && !off}
				disabled={permission === "denied"}
				onCheckedChange={(checked) => void toggle(checked === true)}
			/>
			<FieldContent>
				<FieldLabel htmlFor="notifications">Browser-Benachrichtigungen</FieldLabel>
				<FieldDescription>
					{permission === "denied"
						? "Benachrichtigungen sind in deinem Browser blockiert. Du kannst sie in den Browser-Einstellungen wieder erlauben."
						: "Keine Benachrichtigungen trotz Aktivierung? Prüfe auch die Mitteilungs-Einstellungen deines Browsers und Betriebssystems (z. B. Banner-Stil, Fokus- oder Nicht-stören-Modus)."}
				</FieldDescription>
			</FieldContent>
		</Field>
	);
}

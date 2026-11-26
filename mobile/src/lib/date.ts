import { formatTime, getBerlinDay, TIME_ZONE } from "@food-swap/shared/dates";

// "14:05 Uhr" today, "18.11., 22:10 Uhr" on another day.
export function formatLoadedAt(time: number): string {
	const date = new Date(time);
	const clock = `${formatTime(date.toISOString())} Uhr`;

	if (getBerlinDay(date) === getBerlinDay()) return clock;

	const day = date.toLocaleDateString("de-DE", {
		day: "2-digit",
		month: "2-digit",
		timeZone: TIME_ZONE,
	});
	return `${day}, ${clock}`;
}

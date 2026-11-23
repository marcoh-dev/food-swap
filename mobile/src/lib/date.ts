import { formatDate, formatTime, getBerlinDay, TIME_ZONE } from "@food-swap/shared/dates";

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

/** Time of the last chat message: "14:05" today, otherwise the date ("21.11.2026"), like the web. */
export function formatLastMessageTime(isoDate: string): string {
	return getBerlinDay(new Date(isoDate)) === getBerlinDay()
		? formatTime(isoDate)
		: formatDate(isoDate);
}

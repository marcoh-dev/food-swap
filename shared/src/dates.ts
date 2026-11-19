// Listings end at 23:59 Berlin time on their last day, so days are counted in
// Berlin time on the server, in every browser and in the app.
export const TIME_ZONE = "Europe/Berlin";

// Listings ending within this many days get an "ends soon" badge.
export const END_SOON_DAYS = 7;

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// The Berlin calendar day of a point in time as "YYYY-MM-DD".
export function getBerlinDay(date: Date = new Date()): string {
	const parts = new Intl.DateTimeFormat("de-DE", {
		timeZone: TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);
	const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;

	return `${part("year")}-${part("month")}-${part("day")}`;
}

function toUtcTime(day: string): number {
	const [year, month, date] = day.split("-").map(Number) as [number, number, number];
	return Date.UTC(year, month - 1, date);
}

// Calendar days from today until the Berlin day of isoDate (0 = today, negative = past).
export function getDaysUntil(isoDate: string, now: Date = new Date()): number {
	const endDay = getBerlinDay(new Date(isoDate));
	const today = getBerlinDay(now);

	return Math.round((toUtcTime(endDay) - toUtcTime(today)) / MILLISECONDS_PER_DAY);
}

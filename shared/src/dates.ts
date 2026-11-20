// Listings end at 23:59 Berlin time on their last day, so days are counted in
// Berlin time on the server, in every browser and in the app.
export const TIME_ZONE = "Europe/Berlin";

// Listings ending within this many days get an "ends soon" badge.
export const ENDING_SOON_DAYS = 7;

// Ended listings are deleted this many days after their end day (same rule as
// the backend cleanup in listings.service.ts).
export const DELETE_AFTER_DAYS = 28;

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

// The Berlin time of a point in time as "HH:MM".
export function formatTime(isoDate: string): string {
	const date = new Date(isoDate);

	if (Number.isNaN(date.getTime())) return "";

	return date.toLocaleTimeString("de-DE", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: TIME_ZONE,
	});
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

// Shifts a "YYYY-MM-DD" day by days and/or months.
export function shiftDay(day: string, { days = 0, months = 0 }): string {
	const [year, month, date] = day.split("-").map(Number) as [number, number, number];
	const shifted = new Date(Date.UTC(year, month - 1 + months, date + days));

	return shifted.toISOString().slice(0, 10);
}

function formatDayWithoutYear(day: string): string {
	const [, month, date] = day.split("-");
	return `${date}.${month}.`;
}

// The Berlin date of a point in time as "DD.MM.YYYY".
export function formatDate(isoDate: string): string {
	const date = new Date(isoDate);

	if (Number.isNaN(date.getTime())) return "";

	return date.toLocaleDateString("de-DE", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: TIME_ZONE,
	});
}

// "heute, 14:05", "gestern, 14:05" or "18.11." for older dates.
export function formatListingDate(
	isoDate: string | null | undefined,
	now: Date = new Date(),
): string | null {
	if (!isoDate) return null;

	const date = new Date(isoDate);

	if (Number.isNaN(date.getTime())) return null;

	const day = getBerlinDay(date);
	const today = getBerlinDay(now);

	if (day === today) {
		return `heute, ${formatTime(isoDate)}`;
	}

	if (day === shiftDay(today, { days: -1 })) {
		return `gestern, ${formatTime(isoDate)}`;
	}

	return date.toLocaleDateString("de-DE", {
		day: "2-digit",
		month: "2-digit",
		timeZone: TIME_ZONE,
	});
}

// "Abgelaufen", "Läuft heute ab", "Noch 3 Tage" or "Bis …" further ahead.
export function getEndDateLabel(
	daysLeft: number,
	endDate: string,
	variant: "relative" | "full" = "full",
): string {
	if (daysLeft < 0) return "Abgelaufen";
	if (daysLeft === 0) return "Läuft heute ab";
	if (daysLeft === 1) return "Noch 1 Tag";
	if (daysLeft <= ENDING_SOON_DAYS) return `Noch ${daysLeft} Tage`;

	const label = variant === "full" ? formatDate(endDate) : formatListingDate(endDate);
	return `Bis ${label}`;
}

export function isExpired(isoDate: string, now: Date = new Date()): boolean {
	return getDaysUntil(isoDate, now) < 0;
}

function getDeletionDay(endDate: string): string {
	return shiftDay(getBerlinDay(new Date(endDate)), { days: DELETE_AFTER_DAYS + 1 });
}

// "Wird am 19.12. gelöscht" once a listing has ended, otherwise null.
export function getDeletionLabel(endDate: string, now: Date = new Date()): string | null {
	if (!isExpired(endDate, now)) return null;

	return `Wird am ${formatDayWithoutYear(getDeletionDay(endDate))} gelöscht`;
}

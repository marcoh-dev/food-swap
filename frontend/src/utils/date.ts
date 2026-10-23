import { endDateRules } from "@/lib/constants/listing.constants";
import type { EndDateResult, ParsedEndDate } from "@/lib/types/listing.types";

// Listings end at 23:59 Berlin time on their last day, so dates are shown in
// Berlin time on the server and in every browser.
const TIME_ZONE = "Europe/Berlin";

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export function getCurrentIsoDate(): string {
	return new Date().toISOString();
}

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

// Formats a "YYYY-MM-DD" day like formatDate, without a time zone shift.
export function formatDay(day: string): string {
	const [year, month, date] = day.split("-");
	return `${date}.${month}.${year}`;
}

// The Berlin calendar day of a point in time as "YYYY-MM-DD".
export function getBerlinDay(date: Date = new Date()): string {
	return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
}

function shiftDay(day: string, { days = 0, months = 0 }): string {
	const [year, month, date] = day.split("-").map(Number);
	const shifted = new Date(Date.UTC(year, month - 1 + months, date + days));

	return shifted.toISOString().slice(0, 10);
}

// The calendar works with local dates, the end day rules with Berlin days.
export function toLocalDate(day: string): Date {
	const [year, month, date] = day.split("-").map(Number);
	return new Date(year, month - 1, date);
}

// Formats a local date, like the one picked in the calendar, as "YYYY-MM-DD".
export function formatIsoDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

export function formatTime(isoDate: string): string {
	const date = new Date(isoDate);

	if (Number.isNaN(date.getTime())) return "";

	return date.toLocaleTimeString("de-DE", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: TIME_ZONE,
	});
}

export function isSameDay(a: string, b: string): boolean {
	return getBerlinDay(new Date(a)) === getBerlinDay(new Date(b));
}

export function formatShortDate(isoDate: string): string {
	return isSameDay(isoDate, getCurrentIsoDate()) ? formatTime(isoDate) : formatDate(isoDate);
}

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

export function getDefaultEndDay(now: Date = new Date()): string {
	return shiftDay(getBerlinDay(now), { days: endDateRules.defaultDays });
}

export function getMinEndDay(now: Date = new Date()): string {
	return shiftDay(getBerlinDay(now), { days: endDateRules.minDays });
}

export function getMaxEndDay(now: Date = new Date()): string {
	return shiftDay(getBerlinDay(now), { months: endDateRules.maxMonths });
}

export function parseEndDate(value: FormDataEntryValue | null): ParsedEndDate {
	if (typeof value !== "string" || value === "") return { status: "empty" };
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { status: "invalid" };

	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(year, month - 1, day);

	const isValid =
		date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;

	if (!isValid) return { status: "invalid" };

	return { status: "valid", date };
}

export function isEndDayInRange(day: string, now: Date = new Date()): boolean {
	return day >= getMinEndDay(now) && day <= getMaxEndDay(now);
}

function getEndDateErrorMessage(): string {
	const { minDays, maxMonths } = endDateRules;
	const dayLabel = minDays === 1 ? "Tag" : "Tage";

	return `Das Datum muss mindestens ${minDays} ${dayLabel} und maximal ${maxMonths} Monate in der Zukunft liegen.`;
}

export function validateEndDate(
	value: FormDataEntryValue | null,
	now: Date = new Date(),
): EndDateResult {
	const parsed = parseEndDate(value);

	if (parsed.status === "empty") return { ok: true, date: undefined };

	if (parsed.status === "invalid") return { ok: false, error: getEndDateErrorMessage() };

	const day = value as string;

	if (day < getBerlinDay(now)) {
		return { ok: false, error: "Das Enddatum muss in der Zukunft liegen." };
	}

	if (!isEndDayInRange(day, now)) {
		return { ok: false, error: getEndDateErrorMessage() };
	}

	return { ok: true, date: parsed.date };
}

function toUtcTime(day: string): number {
	const [year, month, date] = day.split("-").map(Number);
	return Date.UTC(year, month - 1, date);
}

export function getDaysUntil(isoDate: string, now: Date = new Date()): number {
	const endDay = getBerlinDay(new Date(isoDate));
	const today = getBerlinDay(now);

	return Math.round((toUtcTime(endDay) - toUtcTime(today)) / MILLISECONDS_PER_DAY);
}

export function getEndDateLabel(
	daysLeft: number,
	endDate: string,
	variant: "relative" | "full" = "full",
): string {
	if (daysLeft < 0) return "Abgelaufen";
	if (daysLeft === 0) return "Läuft heute ab";
	if (daysLeft === 1) return "Noch 1 Tag";
	if (daysLeft <= endDateRules.soonDays) return `Noch ${daysLeft} Tage`;

	const label = variant === "full" ? formatDate(endDate) : formatListingDate(endDate);
	return `Bis ${label}`;
}

export function isExpired(isoDate: string, now: Date = new Date()): boolean {
	return getDaysUntil(isoDate, now) < 0;
}

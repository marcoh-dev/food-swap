import { formatDate, formatTime, getBerlinDay, shiftDay } from "@food-swap/shared/dates";

import { endDateRules } from "@/lib/constants/listing.constants";
import type { EndDateResult, ParsedEndDate } from "@/lib/types/listing.types";

function getCurrentIsoDate(): string {
	return new Date().toISOString();
}

// Formats a "YYYY-MM-DD" day like formatDate, without a time zone shift.
export function formatDay(day: string): string {
	const [year, month, date] = day.split("-");
	return `${date}.${month}.${year}`;
}

// The calendar works with local dates, the end day rules with Berlin days.
export function toLocalDate(day: string): Date {
	const [year, month, date] = day.split("-").map(Number) as [number, number, number];
	return new Date(year, month - 1, date);
}

// Formats a local date, like the one picked in the calendar, as "YYYY-MM-DD".
export function formatIsoDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

export function isSameDay(a: string, b: string): boolean {
	return getBerlinDay(new Date(a)) === getBerlinDay(new Date(b));
}

export function formatShortDate(isoDate: string): string {
	return isSameDay(isoDate, getCurrentIsoDate()) ? formatTime(isoDate) : formatDate(isoDate);
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

	const [year, month, day] = value.split("-").map(Number) as [number, number, number];
	const date = new Date(year, month - 1, day);

	const isValid =
		date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;

	if (!isValid) return { status: "invalid" };

	return { status: "valid", date };
}

function isEndDayInRange(day: string, now: Date = new Date()): boolean {
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

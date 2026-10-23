import { endDateRules } from "@/lib/constants/listing.constants";
import type { EndDateResult, ParsedEndDate } from "@/lib/types/listing.types";

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
	});
}

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
	});
}

export function isSameDay(a: string, b: string): boolean {
	return new Date(a).toDateString() === new Date(b).toDateString();
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

	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);

	if (date.toDateString() === now.toDateString()) {
		return `heute, ${formatTime(isoDate)}`;
	}

	if (date.toDateString() === yesterday.toDateString()) {
		return `gestern, ${formatTime(isoDate)}`;
	}

	return date.toLocaleDateString("de-DE", {
		day: "2-digit",
		month: "2-digit",
	});
}

function getStartOfDay(now: Date): Date {
	const date = new Date(now);
	date.setHours(0, 0, 0, 0);
	return date;
}

export function getEndOfDay(date: Date): Date {
	const result = new Date(date);
	result.setHours(23, 59, 59, 999);
	return result;
}

export function getDefaultEndDate(now: Date = new Date()): Date {
	const date = getStartOfDay(now);
	date.setDate(date.getDate() + endDateRules.defaultDays);
	return date;
}

export function getMinEndDate(now: Date = new Date()): Date {
	const date = getStartOfDay(now);
	date.setDate(date.getDate() + endDateRules.minDays);
	return date;
}

export function getMaxEndDate(now: Date = new Date()): Date {
	const date = getStartOfDay(now);
	date.setMonth(date.getMonth() + endDateRules.maxMonths);
	return date;
}

export function parseEndDate(value: FormDataEntryValue | null): ParsedEndDate {
	if (typeof value !== "string" || value === "") return { status: "empty" };

	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(year, month - 1, day);

	const isValid =
		date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;

	if (!isValid) return { status: "invalid" };

	return { status: "valid", date };
}

export function isEndDateInRange(date: Date, now: Date = new Date()): boolean {
	return date >= getMinEndDate(now) && date <= getMaxEndDate(now);
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

	if (parsed.status === "valid" && parsed.date < getStartOfDay(now)) {
		return { ok: false, error: "Das Enddatum muss in der Zukunft liegen." };
	}

	if (parsed.status === "invalid" || !isEndDateInRange(parsed.date, now)) {
		return { ok: false, error: getEndDateErrorMessage() };
	}

	return { ok: true, date: parsed.date };
}

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export function getDaysUntil(isoDate: string, now: Date = new Date()): number {
	const endDay = getStartOfDay(new Date(isoDate));
	const today = getStartOfDay(now);

	return Math.round((endDay.getTime() - today.getTime()) / MILLISECONDS_PER_DAY);
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

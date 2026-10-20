import { endDateRules } from "@/lib/constants/listing.constants";
import type { ParsedEndDate } from "@/lib/types/listing.types";

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

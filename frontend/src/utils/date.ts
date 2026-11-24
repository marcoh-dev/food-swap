import { formatDate, formatTime, getBerlinDay } from "@food-swap/shared/dates";

function getCurrentIsoDate(): string {
	return new Date().toISOString();
}

export function isSameDay(a: string, b: string): boolean {
	return getBerlinDay(new Date(a)) === getBerlinDay(new Date(b));
}

export function formatShortDate(isoDate: string): string {
	return isSameDay(isoDate, getCurrentIsoDate()) ? formatTime(isoDate) : formatDate(isoDate);
}

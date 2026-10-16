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

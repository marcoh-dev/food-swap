export function parsePage(value: string | string[] | undefined): number {
	return Math.max(1, Math.floor(Number(value)) || 1);
}

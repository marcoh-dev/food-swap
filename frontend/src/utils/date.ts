import { getBerlinDay } from "@food-swap/shared/dates";

export function isSameDay(a: string, b: string): boolean {
	return getBerlinDay(new Date(a)) === getBerlinDay(new Date(b));
}

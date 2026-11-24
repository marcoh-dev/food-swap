import { formatTime, getBerlinDay } from "./dates";
import type { ChatMessage } from "./types";

// Day and minute in Berlin time, e.g. "2026-11-20 14:05"
function sentMinute(message: ChatMessage): string {
	return `${getBerlinDay(new Date(message.createdAt))} ${formatTime(message.createdAt)}`;
}

/**
 * Whether two consecutive messages belong to the same group: sent by the same person in the
 * same minute (Berlin time). A group shows the time only once, below its last message, and its
 * bubbles sit closer together. The same rule in the app and on the web.
 */
export function isSameMessageGroup(a: ChatMessage, b: ChatMessage): boolean {
	return a.senderId === b.senderId && sentMinute(a) === sentMinute(b);
}

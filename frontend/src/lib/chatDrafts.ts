// Unsent texts per chat, or per listing for a first message (see listingDraftKey). Kept in the
// tab's sessionStorage, so they survive switching chats and reloading, until the tab is closed.
// Without storage (e.g. blocked by the browser), drafts just aren't kept.
const PREFIX = "foodswap:chat-draft:";

/** The draft key for the first message about a listing, before there is a chat. */
export function listingDraftKey(listingId: string): string {
	return `listing:${listingId}`;
}

/** The unsent text for a chat or listing, or "" if there is none. */
export function getChatDraft(key: string): string {
	try {
		return sessionStorage.getItem(PREFIX + key) ?? "";
	} catch {
		return "";
	}
}

/** Remembers the unsent text for a chat or listing; an empty text removes it. */
export function setChatDraft(key: string, content: string): void {
	try {
		if (content === "") sessionStorage.removeItem(PREFIX + key);
		else sessionStorage.setItem(PREFIX + key, content);
	} catch {
		// Without storage the draft is only lost when leaving the chat
	}
}

/** Forgets all unsent texts, so the next user in this tab doesn't see them. */
export function clearChatDrafts(): void {
	try {
		const keys = Array.from({ length: sessionStorage.length }, (_, index) =>
			sessionStorage.key(index),
		);
		for (const key of keys) {
			if (key?.startsWith(PREFIX)) sessionStorage.removeItem(key);
		}
	} catch {
		// Nothing was stored
	}
}

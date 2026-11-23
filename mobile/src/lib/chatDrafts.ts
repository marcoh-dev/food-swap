// Unsent reply texts per chat id. Kept in memory only, so they last while the app is running
const drafts = new Map<string, string>();

/** The unsent reply text of a chat, or "" if there is none. */
export function getChatDraft(chatId: string) {
	return drafts.get(chatId) ?? "";
}

/** Remembers the unsent reply text of a chat; an empty text removes it. */
export function setChatDraft(chatId: string, content: string) {
	if (content === "") {
		drafts.delete(chatId);
	} else {
		drafts.set(chatId, content);
	}
}

/** Forgets all unsent reply texts, so the next user on the device doesn't see them. */
export function clearChatDrafts() {
	drafts.clear();
}

/** What a push shows; the service worker (and later the app) also gets `chatId` to open the chat. */
export type PushMessage = {
	title: string;
	body: string;
	chatId: string;
};

// Long enough to recognise the message, short enough for one notification line or two
const PREVIEW_LENGTH = 100;

type ChatPushInput = {
	chatId: string;
	/** The sender's profile name, or their username without one. */
	senderName: string;
	/** null when the listing was deleted. */
	listingTitle: string | null;
	content: string;
};

/**
 * The push for a new chat message. The same texts as the web's in-tab notification in
 * frontend/src/lib/chatEvents.ts; change both together (the backend can't import shared yet).
 */
export function chatPushMessage({
	chatId,
	senderName,
	listingTitle,
	content,
}: ChatPushInput): PushMessage {
	const preview =
		content.length > PREVIEW_LENGTH
			? `${content.slice(0, PREVIEW_LENGTH - 1).trimEnd()}…`
			: content;

	return {
		title: `Neue Nachricht von ${senderName}`,
		body: `${listingTitle ?? "Gelöschtes Angebot"}: ${preview}`,
		chatId,
	};
}

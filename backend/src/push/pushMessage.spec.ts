import { chatPushMessage } from "./pushMessage";

describe("chatPushMessage", () => {
	const input = {
		chatId: "chat-1",
		senderName: "Tomate",
		listingTitle: "Zucchini",
		content: "Ist das noch da?",
	};

	it("names the sender and the listing, like the web's in-tab notification", () => {
		expect(chatPushMessage(input)).toEqual({
			title: "Neue Nachricht von Tomate",
			body: "Zucchini: Ist das noch da?",
			chatId: "chat-1",
		});
	});

	it("says when the listing was deleted", () => {
		expect(chatPushMessage({ ...input, listingTitle: null }).body).toBe(
			"Gelöschtes Angebot: Ist das noch da?",
		);
	});

	it("shortens long messages to 100 characters", () => {
		const { body } = chatPushMessage({ ...input, content: "a".repeat(150) });
		const preview = body.slice("Zucchini: ".length);

		expect(preview).toHaveLength(100);
		expect(preview.endsWith("…")).toBe(true);
	});
});

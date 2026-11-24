"use client";

import { SendHorizontalIcon } from "lucide-react";
import { type KeyboardEvent, type SubmitEvent, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { getChatDraft, setChatDraft } from "@/lib/chatDrafts";

type ChatFormProps = {
	/** Returns the error text to show, or `null` if the message was sent. */
	onSend: (content: string) => Promise<string | null>;
	placeholder?: string;
	/** Keeps unsent text under this key until it's sent (chat id, or `listingDraftKey`). */
	draftKey?: string;
};

const MAX_LENGTH = 2000;

// The server renders the page without the browser's sessionStorage; during hydration this is
// false like on the server, afterwards true, so the draft appears without a mismatch
function subscribeNever() {
	return () => {};
}

function useIsBrowser() {
	return useSyncExternalStore(
		subscribeNever,
		() => true,
		() => false,
	);
}

export function ChatForm({
	onSend,
	placeholder = "Nachricht schreiben…",
	draftKey,
}: ChatFormProps) {
	const isBrowser = useIsBrowser();
	// What the user typed; until then, the saved draft
	const [typed, setTyped] = useState<string | null>(null);
	const content = typed ?? (isBrowser && draftKey ? getChatDraft(draftKey) : "");
	const [error, setError] = useState<string | null>(null);
	const [sending, setSending] = useState(false);

	function changeContent(value: string) {
		setTyped(value);
		if (draftKey) setChatDraft(draftKey, value);
	}

	async function send() {
		const trimmed = content.trim();

		if (!trimmed) {
			setError("Bitte gib eine Nachricht ein");
			return;
		}

		setSending(true);
		setError(null);
		const sendError = await onSend(trimmed);
		setSending(false);

		if (sendError) setError(sendError);
		else changeContent("");
	}

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		void send();
	}

	function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
			event.preventDefault();
			if (!sending) void send();
		}
	}

	return (
		<form onSubmit={handleSubmit} noValidate className="grid gap-2">
			<div className="flex items-end gap-2">
				<Textarea
					value={content}
					onChange={(event) => {
						changeContent(event.target.value);
						if (error) setError(null);
					}}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					aria-label="Nachricht"
					aria-invalid={error ? true : undefined}
					aria-describedby={error ? "chat-form-error" : undefined}
					maxLength={MAX_LENGTH}
					rows={1}
					// The same size as the messages; at 16 px, iPhones don't zoom in when typing
					className="max-h-40 min-h-8 resize-none py-1.5 text-base sm:text-sm md:text-sm"
				/>
				<Button type="submit" size="icon" disabled={sending} aria-label="Senden">
					{sending ? <Spinner /> : <SendHorizontalIcon />}
				</Button>
			</div>
			{error && (
				<p id="chat-form-error" role="alert" className="text-xs text-destructive">
					{error}
				</p>
			)}
		</form>
	);
}

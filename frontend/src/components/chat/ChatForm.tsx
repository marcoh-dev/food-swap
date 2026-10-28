"use client";

import { SendHorizontalIcon } from "lucide-react";
import { type KeyboardEvent, type SubmitEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/store/chat.store";

type ChatFormProps = {
	onSend: (content: string) => Promise<void>;
	placeholder?: string;
};

const MAX_LENGTH = 2000;

export function ChatForm({ onSend, placeholder = "Nachricht schreiben…" }: ChatFormProps) {
	const [content, setContent] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [sending, setSending] = useState(false);

	async function send() {
		const trimmed = content.trim();

		if (!trimmed) {
			setError("Bitte gib eine Nachricht ein");
			return;
		}

		setSending(true);
		setError(null);
		try {
			await onSend(trimmed);
			setContent("");
		} catch (error) {
			setError(errorMessage(error));
		} finally {
			setSending(false);
		}
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
						setContent(event.target.value);
						if (error) setError(null);
					}}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					aria-label="Nachricht"
					aria-invalid={error ? true : undefined}
					aria-describedby={error ? "chat-form-error" : undefined}
					maxLength={MAX_LENGTH}
					rows={1}
					className="max-h-40 min-h-8 py-1.5 resize-none"
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

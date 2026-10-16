"use client";

import { useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ListingChatStatus } from "@/lib/types/chat.types";
import { useChatStore } from "@/store/chat.store";

import { ChatForm } from "./ChatForm";

type ListingChatProps = {
	listingId: string;
	ownerName: string;
	status: ListingChatStatus;
};

export function ListingChat({ listingId, ownerName, status }: ListingChatProps) {
	const startChat = useChatStore((state) => state.startChat);
	const [sent, setSent] = useState(false);

	if (sent) {
		return (
			<ListingChatCard title={`Nachricht an ${ownerName}`}>
				Nachricht gesendet. Alle deine Chats findest du{" "}
				<Link href="/chats" className="underline">
					hier
				</Link>
				.
			</ListingChatCard>
		);
	}

	if (status.chatId && !status.hidden) {
		return (
			<ListingChatCard title={`Nachricht an ${ownerName}`}>
				Du hast {ownerName} bereits geschrieben.{" "}
				<Link href={`/chats?chat=${status.chatId}`} className="underline">
					Zum Chat
				</Link>
			</ListingChatCard>
		);
	}

	return (
		<ListingChatCard
			title={`Nachricht an ${ownerName}`}
			form={
				<ChatForm
					onSend={async (content) => {
						await startChat(listingId, content);
						setSent(true);
					}}
					placeholder={`Schreib ${ownerName}…`}
				/>
			}
		>
			{status.chatId
				? `Setze deinen früheren Chat mit ${ownerName} fort.`
				: "Frag nach dem Angebot oder vereinbare die Übergabe."}
		</ListingChatCard>
	);
}

function ListingChatCard({
	title,
	children,
	form,
}: {
	title: string;
	children: React.ReactNode;
	form?: React.ReactNode;
}) {
	return (
		<Card className="w-full max-w-[450px]">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{children}</CardDescription>
			</CardHeader>
			{form && <CardContent>{form}</CardContent>}
		</Card>
	);
}

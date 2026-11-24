"use client";

import type { ListingChatStatus } from "@food-swap/shared/types";
import Link from "next/link";
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { errorTextOf, useStartChat } from "@/lib/chatQueries";

import { ChatForm } from "./ChatForm";

type ListingChatProps = {
	listingId: string;
	ownerId: string;
	ownerName: string;
	status: ListingChatStatus;
};

export function ListingChat({ listingId, ownerId, ownerName, status }: ListingChatProps) {
	const startChat = useStartChat();
	const [sent, setSent] = useState(false);

	const title = (
		<>
			Nachricht an <Link href={`/users/${ownerId}`}>{ownerName}</Link>
		</>
	);

	if (sent) {
		return <ListingChatCard title={title}>Nachricht gesendet.</ListingChatCard>;
	}

	if (status.chatId && !status.hidden) {
		return (
			<ListingChatCard
				title={
					<>
						Chat mit <Link href={`/users/${ownerId}`}>{ownerName}</Link>
					</>
				}
			>
				<Link href={`/chats?chat=${status.chatId}`} className="underline">
					Zum Chat
				</Link>
			</ListingChatCard>
		);
	}

	return (
		<ListingChatCard
			title={title}
			form={
				<ChatForm
					onSend={async (content) => {
						const error = await errorTextOf(
							startChat.mutateAsync({ listingId, content }),
						);
						if (!error) setSent(true);
						return error;
					}}
					placeholder="Nachricht schreiben…"
				/>
			}
		>
			{status.chatId
				? "Setze deinen früheren Chat fort."
				: "Frag nach dem Angebot oder vereinbare die Übergabe."}
		</ListingChatCard>
	);
}

function ListingChatCard({
	title,
	children,
	form,
}: {
	title: React.ReactNode;
	children: React.ReactNode;
	form?: React.ReactNode;
}) {
	return (
		<Card className="w-full max-w-[450px]">
			<CardHeader>
				<CardTitle>
					<h2>{title}</h2>
				</CardTitle>
				<CardDescription>{children}</CardDescription>
			</CardHeader>
			{form && <CardContent>{form}</CardContent>}
		</Card>
	);
}

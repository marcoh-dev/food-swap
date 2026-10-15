"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Message, MessageContent } from "@/components/ui/message";
import type { ChatMessage } from "@/lib/types/chat.types";
import { useChatStore } from "@/store/chat.store";

import { ChatForm } from "./ChatForm";
import { ChatMessages } from "./ChatConversation";

type ListingChatProps = {
	listingId: string;
	ownerUsername: string;
	currentUserId: string;
};

export function ListingChat({ listingId, ownerUsername, currentUserId }: ListingChatProps) {
	const startChat = useChatStore((state) => state.startChat);
	const conversation = useChatStore((state) => state.conversation);
	const closeChat = useChatStore((state) => state.closeChat);
	const [sent, setSent] = useState<ChatMessage | null>(null);

	useEffect(() => () => closeChat(), [closeChat]);

	const chat = sent && conversation?.id === sent.chatId ? conversation : null;

	return (
		<Card className="w-full max-w-[450px]">
			<CardHeader>
				<CardTitle>Message {ownerUsername}</CardTitle>
				<CardDescription>
					{sent ? (
						<>
							Sent. You can also continue in{" "}
							<Link href={`/chats?chat=${sent.chatId}`}>your chats</Link>.
						</>
					) : (
						"Ask about the listing or arrange the handover."
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-3">
				{chat ? (
					<div className="flex h-64 flex-col border">
						<ChatMessages chat={chat} currentUserId={currentUserId} />
					</div>
				) : (
					sent && (
						<Message align="end">
							<MessageContent>
								<Bubble align="end">
									<BubbleContent className="whitespace-pre-wrap">
										{sent.content}
									</BubbleContent>
								</Bubble>
							</MessageContent>
						</Message>
					)
				)}
				<ChatForm
					onSend={async (content) => {
						setSent(await startChat(listingId, content));
					}}
					placeholder={`Write to ${ownerUsername}…`}
				/>
			</CardContent>
		</Card>
	);
}

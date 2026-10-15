"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, TrashIcon, WarningCircleIcon } from "@phosphor-icons/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Spinner } from "@/components/ui/spinner";
import type { ChatDetail } from "@/lib/types/chat.types";
import { errorMessage, useChatStore } from "@/store/chat.store";
import { formatDate, formatTime, isSameDay } from "@/utils/date";

import { ChatForm } from "./ChatForm";

type ChatConversationProps = {
	chatId: string;
	currentUserId: string;
	onBack: () => void;
	onDeleted: () => void;
};

export function ChatConversation({
	chatId,
	currentUserId,
	onBack,
	onDeleted,
}: ChatConversationProps) {
	const conversation = useChatStore((state) => state.conversation);
	const error = useChatStore((state) => state.conversationError);
	const openChat = useChatStore((state) => state.openChat);
	const closeChat = useChatStore((state) => state.closeChat);
	const sendReply = useChatStore((state) => state.sendReply);

	useEffect(() => {
		void openChat(chatId);
		return () => closeChat();
	}, [chatId, openChat, closeChat]);

	const chat = conversation?.id === chatId ? conversation : null;

	return (
		<section aria-label="Conversation" className="flex h-full min-h-0 flex-col">
			<header className="flex items-center gap-2 border-b px-2 py-2 md:px-4">
				<Button
					variant="ghost"
					size="icon-sm"
					className="md:hidden"
					onClick={onBack}
					aria-label="Back to chats"
				>
					<ArrowLeftIcon />
				</Button>
				<div className="min-w-0 flex-1">
					<h2 className="truncate text-sm font-semibold">
						{chat ? (chat.otherUsername ?? "Deleted user") : " "}
					</h2>
					{chat && (
						<p className="truncate text-xs text-muted-foreground">
							{chat.listingId ? (
								<Link href={`/listings/${chat.listingId}`}>
									{chat.listingTitle}
								</Link>
							) : (
								"Deleted listing"
							)}
						</p>
					)}
				</div>
				{chat && <DeleteChatButton chatId={chat.id} onDeleted={onDeleted} />}
			</header>

			{chat ? (
				<>
					<ChatMessages chat={chat} currentUserId={currentUserId} />
					<footer className="border-t p-2 md:p-4">
						{chat.canReply ? (
							<ChatForm onSend={sendReply} />
						) : (
							<Alert>
								<WarningCircleIcon />
								<AlertDescription>
									The other user has deleted their account. You can&apos;t reply
									anymore.
								</AlertDescription>
							</Alert>
						)}
					</footer>
				</>
			) : error ? (
				<div className="p-4">
					<Alert variant="destructive">
						<WarningCircleIcon />
						<AlertTitle>This chat can&apos;t be shown</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				</div>
			) : (
				<div className="flex flex-1 items-center justify-center">
					<Spinner className="size-6 text-muted-foreground" />
				</div>
			)}
		</section>
	);
}

export function ChatMessages({ chat, currentUserId }: { chat: ChatDetail; currentUserId: string }) {
	return (
		<MessageScrollerProvider autoScroll>
			<MessageScroller className="flex-1">
				<MessageScrollerViewport aria-label="Messages">
					<MessageScrollerContent className="gap-3 p-4">
						{chat.messages.map((message, index) => {
							const own = message.senderId === currentUserId;
							const previous = chat.messages[index - 1];
							const newDay =
								!previous || !isSameDay(previous.createdAt, message.createdAt);

							return (
								<MessageScrollerItem key={message.id} messageId={message.id}>
									{newDay && (
										<Marker variant="separator" className="mb-3">
											<MarkerContent>
												{formatDate(message.createdAt)}
											</MarkerContent>
										</Marker>
									)}
									<Message align={own ? "end" : "start"}>
										<MessageContent>
											<Bubble
												variant={own ? "default" : "muted"}
												align={own ? "end" : "start"}
											>
												<BubbleContent className="whitespace-pre-wrap">
													{message.content}
												</BubbleContent>
											</Bubble>
											<MessageFooter>
												<time dateTime={message.createdAt}>
													{formatTime(message.createdAt)}
												</time>
											</MessageFooter>
										</MessageContent>
									</Message>
								</MessageScrollerItem>
							);
						})}
					</MessageScrollerContent>
				</MessageScrollerViewport>
				<MessageScrollerButton />
			</MessageScroller>
		</MessageScrollerProvider>
	);
}

function DeleteChatButton({ chatId, onDeleted }: { chatId: string; onDeleted: () => void }) {
	const deleteChat = useChatStore((state) => state.deleteChat);
	const [open, setOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleDelete() {
		setDeleting(true);
		setError(null);
		try {
			await deleteChat(chatId);
			setOpen(false);
			onDeleted();
		} catch (error) {
			setError(errorMessage(error));
		} finally {
			setDeleting(false);
		}
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setError(null);
			}}
		>
			<AlertDialogTrigger asChild>
				<Button variant="ghost" size="icon-sm" aria-label="Delete chat">
					<TrashIcon />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogTitle>Delete this chat?</AlertDialogTitle>
					<AlertDialogDescription>
						The chat disappears only for you. If the other person writes again, it comes
						back.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{error && (
					<p role="alert" className="text-xs text-destructive">
						{error}
					</p>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={deleting}
						onClick={(event) => {
							event.preventDefault();
							void handleDelete();
						}}
					>
						{deleting && <Spinner />}
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

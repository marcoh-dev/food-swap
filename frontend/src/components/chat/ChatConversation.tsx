"use client";

import { isSameMessageGroup } from "@food-swap/shared/chat-messages";
import { formatDate, formatTime } from "@food-swap/shared/dates";
import type { ChatDetail, ChatMessage } from "@food-swap/shared/types";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import { ArrowDownIcon, ArrowLeftIcon, CircleAlertIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";

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
	useMessageScroller,
	useMessageScrollerScrollable,
} from "@/components/ui/message-scroller";
import { Spinner } from "@/components/ui/spinner";
import { errorTextOf, markChatRead, useChat, useDeleteChat, useSendReply } from "@/lib/chatQueries";
import { useChatStore } from "@/store/chat.store";
import { isSameDay } from "@/utils/date";

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
	const queryClient = useQueryClient();
	const setOpenChatId = useChatStore((state) => state.setOpenChatId);
	// Deleted in this or another tab while it's open: not loaded again
	const removed = useChatStore((state) => state.removedChatId === chatId);
	const tabVisible = useChatStore((state) => state.tabVisible);
	const atNewest = useChatStore((state) => state.atNewest);
	const { data, error: loadError } = useChat(chatId, { enabled: !removed });
	const sendReply = useSendReply(chatId);

	useEffect(() => {
		setOpenChatId(chatId);
		return () => setOpenChatId(null);
	}, [chatId, setOpenChatId]);

	const chat = removed ? null : (data ?? null);
	const error = removed ? "Dieser Chat wurde gelöscht." : (loadError?.message ?? null);
	const isLoaded = chat !== null;
	const headingRef = useRef<HTMLHeadingElement>(null);

	const newest = chat?.messages.at(-1);
	const markedMessageId = useRef<string | null>(null);

	// Like in the app: a chat counts as read only when its newest message is actually seen, i.e.
	// the tab is visible and the chat is scrolled to the newest message
	useEffect(() => {
		if (!newest || !tabVisible || !atNewest) return;
		// Own messages never make a chat unread; each message is marked only once
		if (newest.senderId === currentUserId || markedMessageId.current === newest.id) return;

		markedMessageId.current = newest.id;
		void markChatRead(queryClient, chatId).then((marked) => {
			// Tried again with the next change, e.g. scrolling or a new message
			if (!marked) markedMessageId.current = null;
		});
	}, [newest, tabVisible, atNewest, currentUserId, chatId, queryClient]);

	useEffect(() => {
		if (isLoaded) headingRef.current?.focus();
	}, [isLoaded]);

	return (
		<section aria-label="Unterhaltung" className="flex h-full min-h-0 flex-col">
			<header className="flex items-center gap-2 border-b px-2 py-2 md:px-4">
				<Button
					variant="ghost"
					size="icon-sm"
					className="md:hidden"
					onClick={onBack}
					aria-label="Zurück zur Chat-Übersicht"
				>
					<ArrowLeftIcon />
				</Button>
				<div className="min-w-0 flex-1">
					<h2
						ref={headingRef}
						tabIndex={-1}
						className={cn(
							"truncate text-sm font-semibold outline-none",
							// A deleted account isn't a person's name
							chat && !chat.otherName && "text-muted-foreground",
						)}
					>
						{chat ? (chat.otherName ?? "Gelöschtes Konto") : " "}
					</h2>
					{chat && (
						<p className="truncate text-xs text-muted-foreground">
							{chat.listingId ? (
								<Link href={`/listings/${chat.listingId}`}>
									{chat.listingTitle}
								</Link>
							) : (
								"Gelöschtes Angebot"
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
							<ChatForm
								onSend={(content) => errorTextOf(sendReply.mutateAsync(content))}
								draftKey={chat.id}
							/>
						) : (
							<Alert>
								<CircleAlertIcon />
								<AlertDescription>
									Die andere Person hat ihr Konto gelöscht. Du kannst nicht mehr
									antworten.
								</AlertDescription>
							</Alert>
						)}
					</footer>
				</>
			) : error ? (
				<div className="p-4">
					<Alert variant="destructive">
						<CircleAlertIcon />
						<AlertTitle>Dieser Chat kann nicht angezeigt werden</AlertTitle>
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

function ChatMessages({ chat, currentUserId }: { chat: ChatDetail; currentUserId: string }) {
	const lastMessage = chat.messages.at(-1);
	const [initialLastMessageId] = useState(lastMessage?.id);
	const isNewIncoming =
		lastMessage &&
		lastMessage.id !== initialLastMessageId &&
		lastMessage.senderId !== currentUserId;

	return (
		<MessageScrollerProvider autoScroll>
			<p aria-live="polite" className="sr-only">
				{isNewIncoming && `${chat.otherName ?? "Gelöschtes Konto"}: ${lastMessage.content}`}
			</p>
			<MessageScroller className="flex-1">
				<MessagesViewport>
					<MessageScrollerContent className="gap-0 p-4">
						{chat.messages.map((message, index) => {
							const own = message.senderId === currentUserId;
							const previous = chat.messages[index - 1];
							const next = chat.messages[index + 1];
							const newDay =
								!previous || !isSameDay(previous.createdAt, message.createdAt);
							// Same person in the same minute, like in the app: one time below the last
							const startsGroup = !previous || !isSameMessageGroup(previous, message);
							const showTime = !next || !isSameMessageGroup(message, next);

							return (
								<MessageScrollerItem
									key={message.id}
									messageId={message.id}
									className={cn(
										// Off-screen messages are drawn right away: with the scroller's assumed
										// height of 10rem, scrolling up jumped whenever a message was drawn
										"[content-visibility:visible]",
										// Spacing like in the app: close within a group, more to the other person
										previous &&
											(!startsGroup
												? "pt-0.5"
												: previous.senderId === message.senderId
													? "pt-3"
													: "pt-5"),
									)}
								>
									{newDay && (
										<Marker variant="separator" className="mb-3">
											<MarkerContent>
												{formatDate(message.createdAt)}
											</MarkerContent>
										</Marker>
									)}
									<Message align={own ? "end" : "start"}>
										<MessageContent className="gap-1">
											<Bubble
												variant={own ? "default" : "muted"}
												align={own ? "end" : "start"}
											>
												<BubbleContent
													className={cn(
														// 16 px on phones like the app, 14 px from sm on
														"rounded-[1rem] text-base whitespace-pre-wrap sm:text-sm",
														// On the sender's side, like in the app: the last bubble of a
														// group is square at the bottom; where bubbles of a group
														// meet, the corners are only slightly rounded
														own
															? showTime
																? "rounded-br-none"
																: "rounded-br-[0.25rem]"
															: showTime
																? "rounded-bl-none"
																: "rounded-bl-[0.25rem]",
														!startsGroup &&
															(own
																? "rounded-tr-[0.25rem]"
																: "rounded-tl-[0.25rem]"),
													)}
												>
													{message.content}
												</BubbleContent>
											</Bubble>
											{showTime && (
												<MessageFooter>
													<time dateTime={message.createdAt}>
														{formatTime(message.createdAt)}
													</time>
												</MessageFooter>
											)}
										</MessageContent>
									</Message>
								</MessageScrollerItem>
							);
						})}
					</MessageScrollerContent>
				</MessagesViewport>
				<ScrollToNewestButton newest={lastMessage} currentUserId={currentUserId} />
				<AtNewestReporter />
				<ScrollToOwnMessage newest={lastMessage} currentUserId={currentUserId} />
			</MessageScroller>
		</MessageScrollerProvider>
	);
}

// The scroller's button to the newest message: an arrow while scrolled up, and "Neue Nachricht"
// like in the app when the other person wrote since the user scrolled away
function ScrollToNewestButton({
	newest,
	currentUserId,
}: {
	newest: ChatMessage | undefined;
	currentUserId: string;
}) {
	const { end: canScrollToEnd } = useMessageScrollerScrollable();
	const [scrolledAway, setScrolledAway] = useState(canScrollToEnd);
	// The newest message when the user scrolled away; anything newer arrived meanwhile
	const [newestWhenScrolledAway, setNewestWhenScrolledAway] = useState(newest?.id);

	// Updated while rendering, so the label is right in the same render
	if (canScrollToEnd !== scrolledAway) {
		setScrolledAway(canScrollToEnd);
		setNewestWhenScrolledAway(newest?.id);
	}

	const hasNewMessage =
		canScrollToEnd &&
		newest !== undefined &&
		newest.id !== newestWhenScrolledAway &&
		newest.senderId !== currentUserId;

	if (!hasNewMessage) {
		return (
			<MessageScrollerButton
				// The same shape as "Neue Nachricht", more subtle
				className="rounded-full border-background bg-muted hover:bg-muted/80"
			/>
		);
	}

	return (
		<MessageScrollerButton
			size="sm"
			// Like in the app: in the primary colour, with a border that sets it apart from own bubbles
			className="w-auto rounded-full border-background bg-primary px-3 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
		>
			<ArrowDownIcon />
			Neue Nachricht
		</MessageScrollerButton>
	);
}

// Like in the app: after sending while scrolled up, the chat scrolls down to show the own
// message (at the bottom, the scroller follows new messages anyway)
function ScrollToOwnMessage({
	newest,
	currentUserId,
}: {
	newest: ChatMessage | undefined;
	currentUserId: string;
}) {
	const { scrollToEnd } = useMessageScroller();
	const lastNewestId = useRef(newest?.id);

	useEffect(() => {
		if (!newest || newest.id === lastNewestId.current) return;

		lastNewestId.current = newest.id;
		// Smooth scrolling isn't possible here: the scroller adjusts its position itself when a
		// message is added and turns it into a jump
		if (newest.senderId === currentUserId) scrollToEnd();
	}, [newest, currentUserId, scrollToEnd]);

	return null;
}

// Tells the chat store whether the chat is scrolled to its newest message, i.e. can't scroll
// further down; marking the chat read depends on it
function AtNewestReporter() {
	const { end: canScrollToEnd } = useMessageScrollerScrollable();
	const setAtNewest = useChatStore((state) => state.setAtNewest);

	useEffect(() => {
		setAtNewest(!canScrollToEnd);
	}, [canScrollToEnd, setAtNewest]);

	return null;
}

// MessageScroller stops following new messages on every wheel or key event and only starts
// again on a scroll event at the bottom. An extra wheel tick or key press at the bottom
// doesn't scroll, so it would stay off; scrolling to the end turns following back on.
function MessagesViewport({ children }: { children: ReactNode }) {
	const { scrollToEnd } = useMessageScroller();

	function followIfAtBottom(viewport: HTMLDivElement, down: boolean) {
		const distance = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
		if (down && distance <= 8) scrollToEnd();
	}

	return (
		<MessageScrollerViewport
			aria-label="Nachrichten"
			onWheel={(event) => followIfAtBottom(event.currentTarget, event.deltaY > 0)}
			onKeyDown={(event) =>
				followIfAtBottom(
					event.currentTarget,
					["ArrowDown", "PageDown", "End"].includes(event.key) ||
						(event.key === " " && !event.shiftKey),
				)
			}
		>
			{children}
		</MessageScrollerViewport>
	);
}

function DeleteChatButton({ chatId, onDeleted }: { chatId: string; onDeleted: () => void }) {
	const deleteChat = useDeleteChat();
	const [open, setOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleDelete() {
		setDeleting(true);
		setError(null);
		const deleteError = await errorTextOf(deleteChat.mutateAsync(chatId));
		setDeleting(false);

		if (deleteError) {
			setError(deleteError);
			return;
		}

		setOpen(false);
		onDeleted();
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
				<Button variant="ghost" size="icon-sm" aria-label="Chat löschen">
					<Trash2Icon />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogTitle>Diesen Chat löschen?</AlertDialogTitle>
					<AlertDialogDescription>
						Der Chat verschwindet aus deiner Liste. Die andere Person behält ihn, bis
						sie ihn auch löscht.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{error && (
					<p role="alert" className="text-xs text-destructive">
						{error}
					</p>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleting}>Abbrechen</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={deleting}
						onClick={(event) => {
							event.preventDefault();
							void handleDelete();
						}}
					>
						{deleting && <Spinner />}
						Löschen
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

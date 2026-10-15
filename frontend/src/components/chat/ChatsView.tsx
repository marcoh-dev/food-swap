"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessagesSquareIcon } from "lucide-react";

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat.store";

import { ChatConversation } from "./ChatConversation";
import { ChatList } from "./ChatList";

type ChatsViewProps = {
	currentUserId: string;
	selectedChatId: string | null;
};

export function ChatsView({ currentUserId, selectedChatId }: ChatsViewProps) {
	const router = useRouter();
	const chats = useChatStore((state) => state.chats);
	const chatsError = useChatStore((state) => state.chatsError);
	const loadChats = useChatStore((state) => state.loadChats);

	useEffect(() => {
		void loadChats();
	}, [loadChats]);

	function selectChat(chatId: string | null) {
		router.push(chatId ? `/chats?chat=${chatId}` : "/chats");
	}

	return (
		<div className="grid h-[calc(100dvh-5.625rem-2em)] overflow-hidden border md:grid-cols-[minmax(16rem,20rem)_1fr]">
			<aside
				aria-label="Deine Chats"
				className={cn(
					"flex min-h-0 flex-col md:border-r",
					selectedChatId && "hidden md:flex",
				)}
			>
				<h1 className="border-b px-4 py-3 text-sm font-semibold">Chats</h1>
				<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
					<ChatList
						chats={chats}
						error={chatsError}
						selectedChatId={selectedChatId}
						onSelect={selectChat}
						onRetry={() => void loadChats()}
					/>
				</div>
			</aside>

			<div className={cn("min-h-0", !selectedChatId && "hidden md:block")}>
				{selectedChatId ? (
					<ChatConversation
						key={selectedChatId}
						chatId={selectedChatId}
						currentUserId={currentUserId}
						onBack={() => selectChat(null)}
						onDeleted={() => selectChat(null)}
					/>
				) : (
					chats &&
					chats.length > 0 && (
						<Empty className="h-full">
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<MessagesSquareIcon />
								</EmptyMedia>
								<EmptyTitle>Wähle einen Chat aus.</EmptyTitle>
							</EmptyHeader>
						</Empty>
					)
				)}
			</div>
		</div>
	);
}

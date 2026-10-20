"use client";

import { CircleAlertIcon, MessagesSquareIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatListItem } from "@/lib/types/chat.types";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/utils/date";

type ChatListProps = {
  chats: ChatListItem[] | null;
  error: string | null;
  selectedChatId: string | null;
  onSelect: (chatId: string) => void;
  onRetry: () => void;
};

export function ChatList({
  chats,
  error,
  selectedChatId,
  onSelect,
  onRetry,
}: ChatListProps) {
  if (!chats && error) {
    return (
      <div className="grid gap-3 p-4">
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Etwas ist schiefgelaufen</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={onRetry}
        >
          Erneut versuchen
        </Button>
      </div>
    );
  }

  if (!chats) return <ChatListSkeleton />;

  if (chats.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessagesSquareIcon />
          </EmptyMedia>
          <EmptyTitle>Du hast noch keine Chats</EmptyTitle>
          <EmptyDescription>
            Schreib jemandem über ein Angebot. Der Chat erscheint dann hier.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul>
      {chats.map((chat) => (
        <li key={chat.id}>
          <button
            type="button"
            onClick={() => onSelect(chat.id)}
            aria-current={chat.id === selectedChatId ? "true" : undefined}
            className={cn(
              "grid w-full gap-0.5 border-b px-4 py-3 text-left text-xs transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
              chat.id === selectedChatId && "bg-muted",
            )}
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate font-medium">
                {chat.otherName ?? "Gelöschtes Konto"}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {formatShortDate(chat.lastMessageAt)}
              </span>
            </span>
            <span className="truncate text-muted-foreground">
              {chat.listingTitle ?? "Gelöschtes Angebot"}
            </span>
            {chat.lastMessage && (
              <span className="truncate">{chat.lastMessage}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

function ChatListSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Chats werden geladen">
      {[0, 1, 2].map((index) => (
        <li key={index} className="grid gap-2 border-b px-4 py-3">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-3/4" />
        </li>
      ))}
    </ul>
  );
}

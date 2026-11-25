import { CHAT_LIST_QUERY_KEY } from "@food-swap/shared/chat-cache";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useIsFocused, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { z } from "zod";

import { isNotFoundError } from "@/api/request";
import { ChatHeaderTitle } from "@/components/ChatHeaderTitle";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatReplyBar } from "@/components/ChatReplyBar";
import { DeleteChatButton } from "@/components/DeleteChatButton";
import { KeyboardAwareView } from "@/components/KeyboardAwareView";
import { Notice } from "@/components/Notice";
import { OfflineNotice } from "@/components/OfflineNotice";
import { RequireLogin } from "@/components/RequireLogin";
import { ServerErrorNotice } from "@/components/ServerErrorNotice";
import { StateScreen } from "@/components/StateScreen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useChat } from "@/hooks/useChat";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDeleteChat } from "@/hooks/useDeleteChat";
import { useIsAppActive } from "@/hooks/useIsAppActive";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useMarkChatRead } from "@/hooks/useMarkChatRead";
import { useShowOfflineNotice } from "@/hooks/useShowOfflineNotice";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function ChatScreen() {
	return (
		<RequireLogin>
			<Conversation />
		</RequireLogin>
	);
}

function Conversation() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const queryClient = useQueryClient();
	const router = useRouter();
	const isValidId = z.uuid().safeParse(id).success;
	const deleteChat = useDeleteChat();
	const {
		data: chat,
		isPending,
		isError,
		isFetching,
		error,
		refetch,
	} = useChat(id, {
		// After deleting, the chat isn't loaded again while the screen closes ("not found")
		enabled: isValidId && !deleteChat.isSuccess,
	});
	const { data: currentUser } = useCurrentUser();
	const isOnline = useIsOnline();
	const showOfflineNotice = useShowOfflineNotice();
	const mutedForeground = useThemeColor("--muted-foreground");
	const isNotFound = !isValidId || isNotFoundError(error);
	const isFocused = useIsFocused();
	const isAppActive = useIsAppActive();
	const [atNewest, setAtNewest] = useState(true);
	const { mutate: markChatRead } = useMarkChatRead();
	const markedMessageId = useRef<string | null>(null);
	const newest = chat?.messages.at(-1);

	// A chat counts as read only when its newest message is actually on screen: this screen is
	// shown, the app is in the foreground and the user hasn't scrolled up into older messages
	useEffect(() => {
		if (!newest || !isFocused || !isAppActive || !atNewest || !isOnline) return;
		// Own messages never make a chat unread; each message is marked only once
		if (newest.senderId === currentUser?.id || markedMessageId.current === newest.id) return;

		markedMessageId.current = newest.id;
		// On an error it's tried again with the next change (e.g. back online)
		markChatRead(newest.chatId, { onError: () => (markedMessageId.current = null) });
	}, [newest, isFocused, isAppActive, atNewest, isOnline, currentUser?.id, markChatRead]);

	// A deleted chat should also disappear from the list when going back
	useEffect(() => {
		if (isNotFoundError(error)) {
			void queryClient.invalidateQueries({ queryKey: CHAT_LIST_QUERY_KEY });
		}
	}, [error, queryClient]);

	function removeChat(chatId: string) {
		deleteChat.mutate(chatId, {
			onSuccess: () => router.dismissTo("/chats"),
			onError: () =>
				Alert.alert("Der Chat konnte nicht gelöscht werden.", "Versuche es nochmal."),
		});
	}

	const header = (
		<Stack.Screen
			options={{
				headerTitle: () => <ChatHeaderTitle chat={chat} />,
				headerRight: chat
					? () => (
							<DeleteChatButton
								onDelete={() => removeChat(chat.id)}
								disabled={!isOnline || deleteChat.isPending}
							/>
						)
					: undefined,
			}}
		/>
	);

	if (isNotFound) {
		return (
			<>
				{header}
				<ChatNotFound />
			</>
		);
	}

	const offlineNotice = showOfflineNotice && (
		<OfflineNotice
			message={
				chat
					? "Neue Nachrichten erscheinen, sobald du wieder online bist."
					: "Der Chat wird geladen, sobald du wieder online bist."
			}
		/>
	);
	const errorNotice = isOnline && isError && (
		<ServerErrorNotice
			message={
				chat
					? "Der Chat konnte nicht aktualisiert werden."
					: "Der Chat konnte nicht geladen werden."
			}
		>
			<Button
				variant="outline"
				className="self-start"
				disabled={isFetching}
				onPress={() => void refetch()}
			>
				<Text>Erneut versuchen</Text>
			</Button>
		</ServerErrorNotice>
	);

	if (!chat) {
		return (
			<>
				{header}
				<StateScreen>
					{offlineNotice}
					{errorNotice}
					{isPending && isOnline && (
						<View className="flex-1 items-center justify-center">
							<ActivityIndicator size="large" color={mutedForeground} />
						</View>
					)}
				</StateScreen>
			</>
		);
	}

	return (
		<KeyboardAwareView>
			{header}
			{(offlineNotice || errorNotice) && (
				<View className="gap-4 px-4 pt-4">
					{offlineNotice}
					{errorNotice}
				</View>
			)}
			<ChatMessages
				messages={chat.messages}
				currentUserId={currentUser?.id}
				otherName={chat.otherName ?? "Gelöschtes Konto"}
				onAtNewestChange={setAtNewest}
			/>
			{chat.canReply ? (
				<ChatReplyBar chatId={chat.id} />
			) : (
				<View className="border-t border-border px-4 pt-4 pb-safe-offset-4">
					<Notice
						icon={{ ios: "info.circle", android: "info" }}
						title="Antworten nicht möglich"
						message="Die andere Person hat ihr Konto gelöscht. Du kannst nicht mehr antworten."
					/>
				</View>
			)}
		</KeyboardAwareView>
	);
}

function ChatNotFound() {
	const router = useRouter();

	return (
		<StateScreen>
			<Text variant="h2">Chat nicht gefunden</Text>
			<Text variant="muted">Diesen Chat gibt es nicht oder nicht mehr.</Text>
			<Button className="self-start" onPress={() => router.dismissTo("/chats")}>
				<Text>Zu den Chats</Text>
			</Button>
		</StateScreen>
	);
}

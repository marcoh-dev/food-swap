import { useQueryClient } from "@tanstack/react-query";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, View } from "react-native";

import { CHATS_QUERY_KEY } from "@/api/chats";
import { ChatRow } from "@/components/ChatRow";
import { OfflineNotice } from "@/components/OfflineNotice";
import { RequireLogin } from "@/components/RequireLogin";
import { Screen } from "@/components/Screen";
import { ServerErrorNotice } from "@/components/ServerErrorNotice";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useChats } from "@/hooks/useChats";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatLoadedAt } from "@/lib/date";
import { cn } from "@/lib/utils";

export default function Chats() {
	return (
		<RequireLogin>
			<ChatList />
		</RequireLogin>
	);
}

function ChatList() {
	const queryClient = useQueryClient();
	const { data, dataUpdatedAt, isPending, isError, isFetching, refetch } = useChats();
	const mutedForeground = useThemeColor("--muted-foreground");
	const card = useThemeColor("--card");
	const isOnline = useIsOnline();
	const [isRefreshing, setIsRefreshing] = useState(false);

	async function refresh() {
		if (!isOnline) {
			return;
		}

		setIsRefreshing(true);
		// The list and the unread count in the tab badge
		await queryClient.refetchQueries({ queryKey: CHATS_QUERY_KEY, type: "active" });
		setIsRefreshing(false);
	}

	const heading = <Text variant="h1">Chats</Text>;
	const offlineNotice = !isOnline && (
		<OfflineNotice
			message={
				data
					? `Du siehst den Stand von ${formatLoadedAt(dataUpdatedAt)}. Deine Chats werden aktualisiert, sobald du wieder online bist.`
					: "Deine Chats werden geladen, sobald du wieder online bist."
			}
		/>
	);
	const errorNotice = isOnline && isError && (
		<ServerErrorNotice
			message={
				data
					? `Deine Chats konnten nicht aktualisiert werden. Du siehst den Stand von ${formatLoadedAt(dataUpdatedAt)}.`
					: "Deine Chats konnten nicht geladen werden."
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

	if (!data) {
		return (
			<Screen>
				{heading}
				{offlineNotice}
				{isPending && isOnline && (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color={mutedForeground} />
					</View>
				)}
				{errorNotice}
			</Screen>
		);
	}

	// The list must be the screen's first view, like on the Angebote tab (iOS tab bar insets).
	return (
		<FlatList
			className="bg-background"
			contentContainerClassName="pb-6"
			contentInsetAdjustmentBehavior="automatic"
			data={data}
			keyExtractor={({ id }) => id}
			extraData={dataUpdatedAt}
			ListHeaderComponent={
				<View
					className={cn(
						"gap-4 border-b border-border px-6 pb-4",
						// iOS adds the status bar inset itself (contentInsetAdjustmentBehavior)
						Platform.OS === "android" ? "pt-safe-offset-6" : "pt-6",
					)}
				>
					{heading}
					{offlineNotice}
					{errorNotice}
				</View>
			}
			ListEmptyComponent={
				<View className="items-center gap-2 px-6 py-12">
					<SymbolView
						name={{ ios: "bubble.left.and.bubble.right", android: "forum" }}
						size={32}
						tintColor={mutedForeground}
					/>
					<Text variant="large">Du hast noch keine Chats</Text>
					<Text variant="muted" className="text-center">
						Schreib jemandem über ein Angebot. Der Chat erscheint dann hier.
					</Text>
				</View>
			}
			refreshControl={
				<RefreshControl
					refreshing={isRefreshing}
					onRefresh={refresh}
					tintColor={mutedForeground}
					colors={mutedForeground ? [mutedForeground] : undefined}
					progressBackgroundColor={card}
				/>
			}
			renderItem={({ item }) => <ChatRow chat={item} />}
		/>
	);
}

import type { ListingResponse, ListingStatus } from "@food-swap/shared/types";
import { useRef, useState } from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, View } from "react-native";

import ListingCard from "@/components/ListingCard";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useListings } from "@/hooks/useListings";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatLoadedAt } from "@/lib/date";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Partial<Record<ListingStatus, string>> = {
	reserved: "Reserviert",
	deactivated: "Deaktiviert",
};

export default function Listings() {
	const {
		data,
		dataUpdatedAt,
		isPending,
		isError,
		isFetching,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetchNextPageError,
	} = useListings();
	const mutedForeground = useThemeColor("--muted-foreground");
	const card = useThemeColor("--card");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const listRef = useRef<FlatList<ListingResponse>>(null);

	async function refresh() {
		setIsRefreshing(true);
		await refetch();
		setIsRefreshing(false);
	}

	function loadMore() {
		if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
			void fetchNextPage();
		}
	}

	const heading = <Text variant="h1">Food Swap</Text>;
	const errorNotice = isError && !isFetchNextPageError && (
		<>
			<Text>
				{data
					? `Die Angebote konnten nicht aktualisiert werden. Du siehst den Stand von ${formatLoadedAt(dataUpdatedAt)}.`
					: "Die Angebote konnten nicht geladen werden."}
			</Text>
			<Button variant="outline" disabled={isFetching} onPress={() => void refetch()}>
				<Text>Erneut versuchen</Text>
			</Button>
		</>
	);

	let footer;
	if (isFetchingNextPage) {
		footer = <ActivityIndicator color={mutedForeground} className="self-center py-4" />;
	} else if (isFetchNextPageError) {
		footer = (
			// iOS: scrollToEnd ignores the space the system adds for the tab bar, so we add it here
			<View
				className={cn("gap-4 px-6 py-6", Platform.OS === "ios" && "pb-24")}
				onLayout={() => listRef.current?.scrollToEnd({ animated: true })}
			>
				<Text variant="muted" className="text-center">Weitere Angebote konnten nicht geladen werden.</Text>
				<Button variant="outline" onPress={() => void fetchNextPage()}>
					<Text>Erneut versuchen</Text>
				</Button>
			</View>
		);
	}

	if (!data) {
		return (
			<Screen>
				{heading}
				{isPending && <ActivityIndicator color={mutedForeground} className="self-start" />}
				{errorNotice}
			</Screen>
		);
	}

	// The list must be the screen's first view: iOS native tabs only find a scroll
	// view along the first children (tab bar minimising, bottom inset, scroll to top).
	return (
		<FlatList
			className="bg-background"
			contentContainerClassName="gap-3 pb-6"
			contentInsetAdjustmentBehavior="automatic"
			data={data.pages.flatMap((page) => page.data)}
			keyExtractor={({ id }) => id}
			extraData={dataUpdatedAt}
			onEndReached={loadMore}
			ref={listRef}
			ListHeaderComponent={
				<View
					className={cn(
						"gap-4 px-6 pb-1",
						// iOS adds the status bar inset itself (contentInsetAdjustmentBehavior)
						Platform.OS === "android" ? "pt-safe-offset-6" : "pt-6",
					)}
				>
					{heading}
					{errorNotice}
					<Text variant="muted">
						{data.pages[0]?.meta.total}{" "}
						{data.pages[0]?.meta.total === 1 ? "Angebot" : "Angebote"}
					</Text>
				</View>
			}
			ListFooterComponent={footer}
			refreshControl={
				<RefreshControl
					refreshing={isRefreshing}
					onRefresh={refresh}
					tintColor={mutedForeground}
					colors={mutedForeground ? [mutedForeground] : undefined}
					progressBackgroundColor={card}
				/>
			}
			renderItem={({ item }) => (
				<ListingCard
					title={item.title}
					image={item.image}
					place={item.place}
					type={item.type}
					category={item.category}
					tags={item.tags}
					createdAt={item.createdAt}
					endDate={item.endDate}
					statusLabel={STATUS_LABELS[item.status]}
					now={dataUpdatedAt}
				/>
			)}
		/>
	);
}

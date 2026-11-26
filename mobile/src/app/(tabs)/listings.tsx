import type { ListingResponse, SortOption } from "@food-swap/shared/types";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Platform,
	Pressable,
	RefreshControl,
	View,
} from "react-native";

import Carousel from "@/components/Carousel";
import ListingCard from "@/components/ListingCard";
import { OfflineNotice } from "@/components/OfflineNotice";
import { Screen } from "@/components/Screen";
import { ServerErrorNotice } from "@/components/ServerErrorNotice";
import { SortingMenu } from "@/components/SortingMenu";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useListings } from "@/hooks/useListings";
import { useShowOfflineNotice } from "@/hooks/useShowOfflineNotice";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatLoadedAt } from "@/lib/date";
import { LISTING_STATUS_LABELS } from "@/lib/listing";
import { cn } from "@/lib/utils";

export default function Listings() {
	const [sort, setSort] = useState<SortOption>("newest");
	const {
		data,
		dataUpdatedAt,
		isPending,
		isError,
		isFetching,
		refetch,
		fetchNextPage,
		hasNextPage,
		isPlaceholderData,
		isFetchingNextPage,
		isFetchNextPageError,
	} = useListings(sort);
	const mutedForeground = useThemeColor("--muted-foreground");
	const card = useThemeColor("--card");
	const isOnline = useIsOnline();
	const showOfflineNotice = useShowOfflineNotice();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const listRef = useRef<FlatList<ListingResponse>>(null);

	async function refresh() {
		if (!isOnline) {
			return;
		}

		setIsRefreshing(true);
		await refetch();
		setIsRefreshing(false);
	}

	function loadMore() {
		// While the previous sort's list is still shown, its pages don't belong to the new sort
		if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError && !isPlaceholderData) {
			void fetchNextPage();
		}
	}

	const heading = <Text variant="h1">Food Swap</Text>;
	const offlineNotice = showOfflineNotice && (
		<OfflineNotice
			message={
				data
					? `Du siehst den Stand von ${formatLoadedAt(dataUpdatedAt)}. Die Angebote werden aktualisiert, sobald du wieder online bist.`
					: "Die Angebote werden geladen, sobald du wieder online bist."
			}
		/>
	);
	const errorNotice = isOnline && isError && !isFetchNextPageError && (
		<ServerErrorNotice
			message={
				data
					? `Die Angebote konnten nicht aktualisiert werden. Du siehst den Stand von ${formatLoadedAt(dataUpdatedAt)}.`
					: "Die Angebote konnten nicht geladen werden."
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
				<Text variant="muted" className="text-center">
					Weitere Angebote konnten nicht geladen werden.
				</Text>
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
					{offlineNotice}
					{errorNotice}
					<Carousel />
					<View className="mt-2 flex-row items-end justify-between gap-2">
						<Text variant="muted">
							{data.pages[0]?.meta.total}{" "}
							{data.pages[0]?.meta.total === 1 ? "Angebot" : "Angebote"}
						</Text>
						<View className="flex-row items-center gap-2">
							<SortingMenu sort={sort} onSortChange={setSort} />
						</View>
					</View>
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
				<Link href={`/listings/${item.id}`} asChild>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={item.title}
						accessibilityHint="Öffnet das Angebot"
					>
						{({ pressed }) => (
							<View className={cn(pressed && "opacity-70")}>
								<ListingCard
									title={item.title}
									image={item.image}
									place={item.place}
									type={item.type}
									category={item.category}
									tags={item.tags}
									createdAt={item.createdAt}
									endDate={item.endDate}
									statusLabel={LISTING_STATUS_LABELS[item.status]}
									now={dataUpdatedAt}
								/>
							</View>
						)}
					</Pressable>
				</Link>
			)}
		/>
	);
}

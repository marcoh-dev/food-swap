import { Link } from "expo-router";
import { useState } from "react";
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
import { OfflineBanner } from "@/components/OfflineBanner";
import { ServerErrorNotice } from "@/components/ServerErrorNotice";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useListings } from "@/hooks/useListings";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatLoadedAt } from "@/lib/date";
import { LISTING_STATUS_LABELS } from "@/lib/listing";
import { cn } from "@/lib/utils";

export default function Listings() {
	const {
		data,
		dataUpdatedAt,
		isPending,
		isError,
		isFetching,
		reload,
		listings,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetchNextPageError,
	} = useListings();
	const mutedForeground = useThemeColor("--muted-foreground");
	const card = useThemeColor("--card");
	const isOnline = useIsOnline();
	const [isRefreshing, setIsRefreshing] = useState(false);

	async function refresh() {
		if (!isOnline) {
			return;
		}

		setIsRefreshing(true);
		await reload();
		setIsRefreshing(false);
	}

	function loadMore() {
		if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
			void fetchNextPage();
		}
	}

	const heading = <Text variant="h1">Food Swap</Text>;
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
				onPress={() => void reload()}
			>
				<Text>Erneut versuchen</Text>
			</Button>
		</ServerErrorNotice>
	);

	// While there are more pages, the end of the list keeps a box for the spinner (or the offline or
	// error text) of the same height: a quick swipe to the end shows it right away, and the list
	// doesn't grow or jump when loading starts, fails or the connection changes
	const footerBox = "min-h-28 justify-center gap-3 px-6";

	let footer;
	// While trying again, the spinner shows instead
	if (isFetchNextPageError && !isFetchingNextPage) {
		footer = (
			<View className={footerBox}>
				<Text variant="muted" className="text-center">
					Weitere Angebote konnten nicht geladen werden.
				</Text>
				<Button variant="outline" onPress={() => void fetchNextPage()}>
					<Text>Erneut versuchen</Text>
				</Button>
			</View>
		);
	} else if (hasNextPage && !isOnline) {
		// Offline, loading the next page waits (TanStack pauses it) and continues once back online
		footer = (
			<View className={footerBox}>
				<Text variant="muted" className="text-center">
					Weitere Angebote werden geladen, sobald du wieder online bist.
				</Text>
			</View>
		);
	} else if (hasNextPage) {
		footer = (
			<View className={footerBox}>
				<ActivityIndicator color={mutedForeground} />
			</View>
		);
	}

	// The list must be the screen's first child: iOS native tabs only find a scroll
	// view along the first children (tab bar minimising, bottom inset, scroll to top).
	// It's also there while nothing has loaded yet, so the header with the carousel
	// stays in place when the offers arrive.
	return (
		<View className="flex-1 bg-background">
			<FlatList
				className="bg-background"
				contentContainerClassName="gap-3 pb-6"
				contentInsetAdjustmentBehavior="automatic"
				data={listings}
				keyExtractor={({ id }) => id}
				extraData={dataUpdatedAt}
				onEndReached={loadMore}
				// Loads the next page one screen height before the end (default: half), so a fast swipe
				// rarely reaches the spinner
				onEndReachedThreshold={1}
				// Keeps the listings in place when a notice above them appears or disappears (e.g. the server
				// error notice while scrolled down); at the top, the list stays at the top so the notice shows
				maintainVisibleContentPosition={{
					minIndexForVisible: 0,
					autoscrollToTopThreshold: 40,
				}}
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
						<Carousel />
						{data && (
							<Text variant="muted">
								{data.pages[0]?.meta.total}{" "}
								{data.pages[0]?.meta.total === 1 ? "Angebot" : "Angebote"}
							</Text>
						)}
					</View>
				}
				ListEmptyComponent={
					isPending && isOnline ? (
						<ActivityIndicator size="large" color={mutedForeground} className="py-12" />
					) : undefined
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
			<OfflineBanner loadedAt={data && dataUpdatedAt} />
		</View>
	);
}

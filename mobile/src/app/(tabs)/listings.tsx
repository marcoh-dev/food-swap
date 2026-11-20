import type { ListingStatus } from "@food-swap/shared/types";
import { useState } from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, View } from "react-native";

import ListingCard from "@/components/ListingCard";
import { Notice } from "@/components/Notice";
import { OfflineNotice } from "@/components/OfflineNotice";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useListings } from "@/hooks/useListings";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatLoadedAt } from "@/lib/date";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Partial<Record<ListingStatus, string>> = {
	reserved: "Reserviert",
	deactivated: "Deaktiviert",
};

export default function Listings() {
	const { data, dataUpdatedAt, isPending, isError, isFetching, refetch } = useListings();
	const mutedForeground = useThemeColor("--muted-foreground");
	const card = useThemeColor("--card");
	const isOnline = useIsOnline();
	const [isRefreshing, setIsRefreshing] = useState(false);

	async function refresh() {
		if (!isOnline) {
			return;
		}

		setIsRefreshing(true);
		await refetch();
		setIsRefreshing(false);
	}

	const heading = <Text variant="h1">Food Swap</Text>;
	const offlineNotice = !isOnline && (
		<OfflineNotice
			message={
				data
					? `Du siehst den Stand von ${formatLoadedAt(dataUpdatedAt)}. Die Angebote werden aktualisiert, sobald du wieder online bist.`
					: "Die Angebote werden geladen, sobald du wieder online bist."
			}
		/>
	);
	const errorNotice = isOnline && isError && (
		<Notice
			icon={{ ios: "exclamationmark.triangle", android: "warning" }}
			variant="destructive"
			title="Laden fehlgeschlagen"
			message={
				data
					? `Die Angebote konnten nicht aktualisiert werden. Du siehst den Stand von ${formatLoadedAt(dataUpdatedAt)}.`
					: "Die Angebote konnten nicht geladen werden."
			}
		>
			<Button variant="outline" disabled={isFetching} onPress={() => void refetch()}>
				<Text>Erneut versuchen</Text>
			</Button>
		</Notice>
	);

	if (!data) {
		return (
			<Screen>
				{heading}
				{offlineNotice}
				{isPending && isOnline && (
					<ActivityIndicator color={mutedForeground} className="self-start" />
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
			data={data.data}
			keyExtractor={({ id }) => id}
			extraData={dataUpdatedAt}
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
					<Text variant="muted">
						{data.meta.total} {data.meta.total === 1 ? "Angebot" : "Angebote"}
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

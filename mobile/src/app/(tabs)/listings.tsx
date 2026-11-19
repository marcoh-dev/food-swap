import type { ListingStatus } from "@food-swap/shared/types";
import { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";

import ListingCard from "@/components/ListingCard";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useListings } from "@/hooks/useListings";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatLoadedAt } from "@/lib/date";

const STATUS_LABELS: Partial<Record<ListingStatus, string>> = {
	reserved: "Reserviert",
	deactivated: "Deaktiviert",
};

export default function Listings() {
	const { data, dataUpdatedAt, isPending, isError, isFetching, refetch } = useListings();
	const mutedForeground = useThemeColor("--muted-foreground");
	const card = useThemeColor("--card");
	const [isRefreshing, setIsRefreshing] = useState(false);

	async function refresh() {
		setIsRefreshing(true);
		await refetch();
		setIsRefreshing(false);
	}

	return (
		<Screen>
			<Text variant="h1">Food Swap</Text>
			{isPending && <ActivityIndicator color={mutedForeground} className="self-start" />}
			{isError && (
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
			)}
			{data && (
				<>
					<Text variant="muted">
						{data.meta.total} {data.meta.total === 1 ? "Angebot" : "Angebote"}
					</Text>
					<FlatList
						className="-mx-6"
						contentContainerClassName="gap-3 pb-6"
						contentInsetAdjustmentBehavior="automatic"
						data={data.data}
						keyExtractor={({ id }) => id}
						extraData={dataUpdatedAt}
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
				</>
			)}
		</Screen>
	);
}

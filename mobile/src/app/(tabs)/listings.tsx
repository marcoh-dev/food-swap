import type { ListingResponse, ListingStatus } from "@food-swap/shared/types";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";

import Carousel from "@/components/Carousel";
import ListingCard from "@/components/ListingCard";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useListingCount } from "@/hooks/useListingCount";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getListings } from "@/lib/listingActions";

const STATUS_LABELS: Partial<Record<ListingStatus, string>> = {
	reserved: "Reserviert",
	deactivated: "Deaktiviert",
};

export default function Listings() {
	const { data: count, isPending, isError, isFetching, refetch } = useListingCount();
	const mutedForeground = useThemeColor("--muted-foreground");

	const [listings, setListings] = useState<ListingResponse[]>([]);
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		async function fetchListings() {
			try {
				const data = await getListings();
				setListings(data);
				setNow(Date.now());
			} catch (error) {
				console.error(error);
			}
		}
		fetchListings();
	}, []);

	return (
		<Screen>
			<Text variant="h1">Food Swap</Text>
			<Carousel />
			{isPending ? (
				<ActivityIndicator color={mutedForeground} className="self-start" />
			) : isError ? (
				<>
					<Text>Die Angebote konnten nicht geladen werden.</Text>
					<Button variant="outline" disabled={isFetching} onPress={() => void refetch()}>
						<Text>Erneut versuchen</Text>
					</Button>
				</>
			) : (
				<Text variant="muted">
					{count} {count === 1 ? "Angebot" : "Angebote"}
				</Text>
			)}
			<FlatList
				className="-mx-6"
				contentContainerClassName="gap-3"
				data={listings}
				keyExtractor={({ id }) => id}
				extraData={now}
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
						now={now}
					/>
				)}
			/>
		</Screen>
	);
}

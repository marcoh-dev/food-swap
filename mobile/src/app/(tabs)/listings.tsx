import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useListingCount } from "@/hooks/useListingCount";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getListings } from "@/lib/listingActions";
import type { ListingResponse } from "@/lib/types/listing.types";

export default function Listings() {
	const { data: count, isPending, isError, isFetching, refetch } = useListingCount();
	const mutedForeground = useThemeColor("--muted-foreground");
	const [listings, setListings] = useState<ListingResponse[]>([]);

	useEffect(() => {
		async function loadListings() {
			const data = await getListings();
			setListings(data);
		}

		loadListings();
	}, []);

	return (
		<Screen>
			<Text variant="h1">Food Swap</Text>
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
			<ScrollView contentContainerStyle={styles.list}>
				{listings.map(
					({
						id,
						title,
						description,
						image,
						place,
						distance,
						type,
						status,
						category,
						tags,
						createdAt,
						endDate,
						updatedAt,
					}) => (
						<View style={styles.card} key={id}>
							<Image source={{ uri: image }} style={styles.image}></Image>
							<View style={styles.content}>
								<Text>{title}</Text>
								<Text>{description}</Text>
								<Text>{place.city}</Text>
							</View>
						</View>
					),
				)}
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	list: {
		gap: 10,
	},
	card: {
		flexDirection: "row",
		gap: 12,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: "white",
	},
	image: {
		width: "40%",
		height: 200,
	},
	content: {
		flex: 1,
	},
});

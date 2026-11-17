import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { getListings } from "@/lib/listingActions";
import type { ListingResponse } from "@/lib/types/listing.types";

export default function Listings() {
	const [listings, setListings] = useState<ListingResponse[]>([]);

	useEffect(() => {
		async function loadListings() {
			const data = await getListings();
			setListings(data);
		}

		loadListings();
	}, []);

	return (
		<SafeAreaView edges={["top"]} className="flex-1 gap-4 bg-background p-6">
			<Text variant="h1">Food Swap</Text>
			<Text variant="muted">NativeWind 5 + React Native Reusables</Text>
			<Button onPress={() => console.log("pressed")}>
				<Text>Primary</Text>
			</Button>
			<Button variant="outline">
				<Text>Outline</Text>
			</Button>
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
		</SafeAreaView>
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

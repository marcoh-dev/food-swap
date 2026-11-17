import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { mockListings as data } from "@/lib/data/listings.mockdata";
import type { ListingResponse } from "@/lib/types/listing.types";


export default function Listings() {
const mockListings: ListingResponse[] = data;

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
			<ScrollView>{mockListings.map(({id, title}) => <Text key={id}>{title}</Text>)}</ScrollView>
			
		</SafeAreaView>
	);
}

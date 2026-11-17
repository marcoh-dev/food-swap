import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function Listings() {
	return (
		<View className="flex-1 items-center justify-center gap-4 bg-background p-6">
			<Text variant="h1">Food Swap</Text>
			<Text variant="muted">NativeWind 5 + React Native Reusables</Text>
			<Button onPress={() => console.log("pressed")}>
				<Text>Primary</Text>
			</Button>
			<Button variant="outline">
				<Text>Outline</Text>
			</Button>
		</View>
	);
}

import { Image } from "expo-image";
import { View } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

/** The FoodSwap logo on a muted background, shown for listings without an image (like on the web). */
export function ListingImagePlaceholder() {
	const card = useThemeColor("--card");

	return (
		<View className="absolute inset-0 items-center justify-center bg-muted">
			<Image
				source={require("@food-swap/shared/assets/listing-placeholder.svg")}
				tintColor={card}
				contentFit="contain"
				style={{ width: "66%", height: "66%" }}
				accessible={false}
			/>
		</View>
	);
}

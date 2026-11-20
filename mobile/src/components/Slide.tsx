import { Text, View } from "react-native";

export default function Slide() {
	return (
		<View className="min-h-52 overflow-hidden rounded-2xl bg-primary px-3 py-3">
			<View className="mt-auto gap-1 p-4">
				<Text className="font-medium text-2xl text-foreground">Warum Tomatoes?</Text>
				<Text className="text-foreground">
					Die drei EntwicklerInnen hinter FoodSwap lieben Pomodori. Und finden es lustig,
					die Lerntechnik Pomodoro auch mal als Tomato zu bezeichnen.
				</Text>
			</View>
		</View>
	);
}

// return <View className="flex-col gap-2 px-3 py-3 h-44 bg-primary rounded-2xl "><View><Image src="https://images.pexels.com/photos/39150349/pexels-photo-39150349.jpeg" resizeMode="cover"/></View><Text className="font-medium text-base text-foreground">Neues von den drei Tomatoes</Text><Text className="text-foreground">Get to Know the Three Tomatoes</Text></View>

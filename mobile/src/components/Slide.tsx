import { Text, View } from "react-native";

type Props = { title: string; body: string };

export default function Slide({ title, body }: Props) {
	return (
		<View className="min-h-52 overflow-hidden rounded-2xl bg-primary px-3 py-3">
			<View className="mt-auto gap-1 p-4">
				<Text className="font-medium text-2xl text-foreground">{title}</Text>
				<Text className="text-foreground">{body}</Text>
			</View>
		</View>
	);
}

// return <View className="flex-col gap-2 px-3 py-3 h-44 bg-primary rounded-2xl "><View><Image src="https://images.pexels.com/photos/39150349/pexels-photo-39150349.jpeg" resizeMode="cover"/></View><Text className="font-medium text-base text-foreground">Neues von den drei Tomatoes</Text><Text className="text-foreground">Get to Know the Three Tomatoes</Text></View>

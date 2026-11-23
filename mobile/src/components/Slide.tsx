import { Image, Text, View } from "react-native";

type Props = { title: string; body: string; source?: string; image?: string };

export default function Slide({ title, body, source, image }: Props) {
	return (
		<View className="rounded-2xl bg-highlight-muted shadow-md shadow-black/25 dark:border dark:border-highlight-border">
			<View className="h-54 overflow-hidden rounded-2xl px-2 py-2">
				{image ? (
					<>
						<Image
							source={{ uri: image }}
							resizeMode="cover"
							className="absolute inset-0"
						/>
						<View className="absolute inset-0 bg-black/20" />
					</>
				) : null}
				<View className="mt-auto gap-1 p-4">
					<Text className="font-bold text-3xl text-highlight-foreground">{title}</Text>
					<Text className="text-highlight-foreground">{body}</Text>
					{source ? (
						<Text className="text-xs text-highlight-muted-foreground">{source}</Text>
					) : null}
				</View>
			</View>
		</View>
	);
}

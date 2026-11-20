import { Image, Text, View } from "react-native";

type Props = { title: string; body: string; source?: string, image?: string };

export default function Slide({ title, body, source, image }: Props) {
	return (
		<View className="min-h-52 overflow-hidden rounded-2xl bg-destructive-inverse px-3 py-3">
			 {image ? (
                                <>
                                        <Image source={{ uri: image }} resizeMode="cover" className="absolute inset-0" />
                                        {/* dunkler Schleier, damit der Text lesbar bleibt */}
                                        <View className="absolute inset-0" />
                                </>
                        ) : null}
			<View className="mt-auto gap-1 p-4">
				<Text className="font-medium text-2xl text-destructive-inverse-foreground">{title}</Text>
				<Text className="text-destructive-inverse-foreground">{body}</Text>
				{source ? (
        <Text className="text-xs text-destructive-inverse-foreground">{source}</Text>
) : null}
			</View>
		</View>
	);
}
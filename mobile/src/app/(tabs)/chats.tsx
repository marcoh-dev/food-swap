import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chats() {
	return (
		<SafeAreaView
			edges={["top"]}
			className="flex-1 items-center justify-center gap-4 bg-background p-6"
		>
			<Text>Chat</Text>
		</SafeAreaView>
	);
}

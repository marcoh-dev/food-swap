import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function New() {
	return (
		<SafeAreaView edges={["top"]} className="flex-1 gap-4 bg-background p-6">
			<Text>New</Text>
		</SafeAreaView>
	);
}

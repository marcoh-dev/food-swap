import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";

export default function Profile() {
	return (
		<SafeAreaView edges={["top"]} className="flex-1 gap-4 bg-background p-6">
			<Text variant="h2">Profile</Text>
		</SafeAreaView>
	);
}

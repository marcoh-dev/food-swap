import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useListingCount } from "@/hooks/useListingCount";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function Listings() {
	const { data: count, isPending, isError, isFetching, refetch } = useListingCount();
	const mutedForeground = useThemeColor("--muted-foreground");

	return (
		<SafeAreaView edges={["top"]} className="flex-1 gap-4 bg-background p-6">
			<Text variant="h1">Food Swap</Text>
			{isPending ? (
				<ActivityIndicator color={mutedForeground} className="self-start" />
			) : isError ? (
				<>
					<Text>Die Angebote konnten nicht geladen werden.</Text>
					<Button variant="outline" disabled={isFetching} onPress={() => void refetch()}>
						<Text>Erneut versuchen</Text>
					</Button>
				</>
			) : (
				<Text variant="muted">
					{count} {count === 1 ? "Angebot" : "Angebote"}
				</Text>
			)}
		</SafeAreaView>
	);
}

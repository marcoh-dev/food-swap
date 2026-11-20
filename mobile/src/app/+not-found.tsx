import { useRouter } from "expo-router";

import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { HOME_ROUTE } from "@/lib/routes";

export default function NotFound() {
	const router = useRouter();

	return (
		<Screen>
			<Text variant="h2">Seite nicht gefunden</Text>
			<Text variant="muted">Diese Seite gibt es nicht oder nicht mehr.</Text>
			<Button onPress={() => router.replace(HOME_ROUTE)}>
				<Text>Zu den Angeboten</Text>
			</Button>
		</Screen>
	);
}

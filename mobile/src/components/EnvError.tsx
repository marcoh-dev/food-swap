import { ScrollView } from "react-native";

import { Text } from "@/components/ui/text";

type Props = {
	message: string;
};

export function EnvError({ message }: Props) {
	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="gap-4 p-safe-offset-6"
			accessibilityRole="alert"
		>
			<Text variant="h2">Konfiguration ungültig</Text>
			<Text>
				Prüfe EXPO_PUBLIC_API_URL in mobile/.env.local und starte die App danach mit „pnpm
				mobile --clear“ neu.
			</Text>
			<Text variant="code">{message}</Text>
		</ScrollView>
	);
}

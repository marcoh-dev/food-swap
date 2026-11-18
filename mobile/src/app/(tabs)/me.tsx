import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/components/AuthProvider";
import { RequireLogin } from "@/components/RequireLogin";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function Profile() {
	return (
		<RequireLogin>
			<ProfileContent />
		</RequireLogin>
	);
}

function ProfileContent() {
	const { logOut } = useAuth();
	const { data: user, isPending, isError, isFetching, refetch } = useCurrentUser();
	const mutedForeground = useThemeColor("--muted-foreground");

	return (
		<Screen>
			{isPending ? (
				<ActivityIndicator color={mutedForeground} className="self-start" />
			) : isError ? (
				<>
					<Text>Dein Profil konnte nicht geladen werden.</Text>
					<Button variant="outline" disabled={isFetching} onPress={() => void refetch()}>
						<Text>Erneut versuchen</Text>
					</Button>
				</>
			) : (
				<>
					<View className="gap-1">
						<Text variant="h2">{user.name ?? user.username}</Text>
						{user.name ? null : <Text variant="muted">Kein Profilname vergeben.</Text>}
					</View>
					<Text>
						<Text className="text-muted-foreground">Benutzername: </Text>
						{user.username}
					</Text>
				</>
			)}
			<Button variant="outline" onPress={() => void logOut()}>
				<Text>Abmelden</Text>
			</Button>
		</Screen>
	);
}

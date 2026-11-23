import { formatDate } from "@food-swap/shared/dates";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/components/AuthProvider";
import { OfflineNotice } from "@/components/OfflineNotice";
import { RequireLogin } from "@/components/RequireLogin";
import { Screen } from "@/components/Screen";
import { ServerErrorNotice } from "@/components/ServerErrorNotice";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useLogoutEverywhere } from "@/hooks/useLogoutEverywhere";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useUser } from "@/hooks/useUser";

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
	const profileQuery = useUser(user?.id);
	const profile = profileQuery.data;
	const isOnline = useIsOnline();
	const logoutEverywhere = useLogoutEverywhere();
	const mutedForeground = useThemeColor("--muted-foreground");
const isLoading = !profile && isOnline && (isPending || (!!user && profileQuery.isPending));
	const hasError = isError || profileQuery.isError;

	return (
		<Screen>
			{!isOnline && (
				<OfflineNotice
					message={
						profile
							? "Dein Profil wird aktualisiert, sobald du wieder online bist."
							: "Dein Profil wird geladen, sobald du wieder online bist."
					}
				/>
			)}
			{isOnline && hasError && (
				<ServerErrorNotice
					message={
						profile
							? "Dein Profil konnte nicht aktualisiert werden."
							: "Dein Profil konnte nicht geladen werden."
					}
				>
					<Button
						variant="outline"
						className="self-start"
						disabled={isFetching || profileQuery.isFetching}
						onPress={() => {
							void refetch();
							void profileQuery.refetch();
						}}
					>
						<Text>Erneut versuchen</Text>
					</Button>
				</ServerErrorNotice>
			)}
			{profile ? (
				<>
					{/* public: GET /users/:id */}
					<View className="gap-1">
						<Text variant="h2">{profile.name ?? profile.username}</Text>
						{profile.name ? null : (
							<Text variant="muted">Kein Profilname vergeben.</Text>
						)}
					</View>
					{/* private: GET /auth/me */}
					{user && (
						<Text>
							<Text className="text-muted-foreground">Benutzername: </Text>
							{user.username}
						</Text>
					)}
					<Text>
						<Text className="text-muted-foreground">Registriert seit: </Text>
						{formatDate(profile.createdAt)}
					</Text>
				</>
			) : isLoading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={mutedForeground} />
				</View>
			) : null}
			{!isLoading && (
				<>
					<Button variant="outline" onPress={() => void logOut()}>
						<Text>Abmelden</Text>
					</Button>
					<View className="gap-2">
						<Button
							variant="outline"
							disabled={!isOnline || logoutEverywhere.isPending}
							onPress={() => logoutEverywhere.mutate()}
						>
							<Text>Überall abmelden</Text>
						</Button>
						<Text variant="muted">Auf allen Geräten abmelden.</Text>
						{logoutEverywhere.isError && (
							<Text className="text-destructive">
								Abmelden auf allen Geräten hat nicht geklappt. Bitte versuche es
								nochmal.
							</Text>
						)}
					</View>
				</>
			)}
		</Screen>
	);
}

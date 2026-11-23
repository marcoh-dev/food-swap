import { formatDate } from "@food-swap/shared/dates";
import { formatPlace } from "@food-swap/shared/places";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
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
	const router = useRouter();
	const { logOut } = useAuth();
	const { data: user, isPending, isError, isFetching, refetch } = useCurrentUser();
	const profileQuery = useUser(user?.id);
	const profile = profileQuery.data;
	const isOnline = useIsOnline();
	const logoutEverywhere = useLogoutEverywhere();
	const foreground = useThemeColor("--foreground");
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
				<View className="gap-4 rounded-xl border border-border bg-card p-4">
					{/* public: GET /users/:id */}
					<View className="flex-row items-start justify-between gap-3">
						<View className="flex-1 gap-1">
							<Text variant="h2">{profile.name ?? profile.username}</Text>
							{profile.name ? null : (
								<Text variant="muted">Kein Profilname vergeben.</Text>
							)}
						</View>
						<Button
							variant="outline"
							size="icon"
							accessibilityLabel="Profil bearbeiten"
							onPress={() => {router.push("/profile/edit")}}
						>
							<SymbolView
								name={{ ios: "pencil", android: "edit" }}
								size={18}
								tintColor={foreground}
							/>
						</Button>
					</View>
					{/* private: GET /auth/me */}
					{user && (
						<>
							<ProfileField label="Benutzername" value={user.username} />
							<ProfileField
								label="Standort"
								value={user.place ? formatPlace(user.place) : "Kein Ort gewählt."}
							/>
						</>
					)}
					<ProfileField label="Registriert seit" value={formatDate(profile.createdAt)} />
				</View>
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

function ProfileField({ label, value }: { label: string; value: string }) {
	return (
		<View className="gap-0.5">
			<Text variant="muted">{label}</Text>
			<Text>{value}</Text>
		</View>
	);
}

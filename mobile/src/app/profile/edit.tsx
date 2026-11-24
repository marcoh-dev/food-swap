import { formatPlace } from "@food-swap/shared/places";
import { profileSchema, type ProfileValues } from "@food-swap/shared/schemas/user";
import type { CurrentUser, Place, User } from "@food-swap/shared/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Keyboard, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { z } from "zod";

import { OfflineNotice } from "@/components/OfflineNotice";
import { PlacePicker } from "@/components/PlacePicker";
import { RequireLogin } from "@/components/RequireLogin";
import { ServerErrorNotice } from "@/components/ServerErrorNotice";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useUser } from "@/hooks/useUser";

type FieldErrors = Partial<Record<keyof ProfileValues, string[]>>;

export default function ProfileEdit() {
	return (
		<RequireLogin>
			<ProfileEditContent />
		</RequireLogin>
	);
}

function ProfileEditContent() {
	const { data: user } = useCurrentUser();
	const { data: profile } = useUser(user?.id);
	const mutedForeground = useThemeColor("--muted-foreground");

	if (!user || !profile) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator size="large" color={mutedForeground} />
			</View>
		);
	}

	// Mounted only with loaded data, so the form starts with the saved values
	return <ProfileEditForm user={user} profile={profile} />;
}

function ProfileEditForm({ user, profile }: { user: CurrentUser; profile: User }) {
	const router = useRouter();
	const isOnline = useIsOnline();
	const updateProfile = useUpdateProfile(user.id);
	const [name, setName] = useState(profile.name ?? "");
	const [place, setPlace] = useState<Place | null>(user.place ?? null);
	const [placeQuery, setPlaceQuery] = useState(user.place ? formatPlace(user.place) : "");
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const deleteAccount = useDeleteAccount({ onDeleted: () => router.back() });

	function handleSubmit() {
		if (!isOnline) return;

		const result = profileSchema.safeParse({ name, placeId: place?.id ?? "", placeQuery });
		if (!result.success) {
			setFieldErrors(z.flattenError(result.error).fieldErrors);
			return;
		}

		updateProfile.mutate(
			{ name: result.data.name, placeId: result.data.placeId || null },
			{ onSuccess: () => router.back() },
		);
	}

	function confirmDeleteAccount() {
		Alert.alert(
			"Konto wirklich löschen?",
			"Dieser Schritt kann nicht rückgängig gemacht werden.",
			[
				{ text: "Abbrechen", style: "cancel" },
				{
					text: "Endgültig löschen",
					style: "destructive",
					onPress: () => deleteAccount.mutate(user.id),
				},
			],
		);
	}

	return (
		<KeyboardAwareScrollView
			className="flex-1 bg-background"
			contentContainerClassName="gap-4 p-6"
			contentInsetAdjustmentBehavior="automatic"
			keyboardShouldPersistTaps="handled"
			bottomOffset={160}
		>
			{!isOnline && (
				<OfflineNotice message="Du kannst dein Profil bearbeiten, sobald du wieder online bist." />
			)}
			{isOnline && updateProfile.isError && (
				<ServerErrorNotice message="Dein Profil konnte nicht gespeichert werden. Bitte versuche es später noch mal." />
			)}
			<TextField
				label="Profilname"
				description="Für andere User sichtbar."
				placeholder="z. B. Tomato"
				value={name}
				onChangeText={(value) => {
					setName(value);
					setFieldErrors((previous) => ({ ...previous, name: undefined }));
				}}
				error={fieldErrors.name?.[0]}
				returnKeyType="done"
				onSubmitEditing={handleSubmit}
			/>
			<PlacePicker
				query={placeQuery}
				selectedPlace={place}
				description="Wird beim Erstellen eines Angebots vorausgefüllt. Nur für dich sichtbar."
				error={fieldErrors.placeId?.[0]}
				onQueryChange={(value) => {
					setPlaceQuery(value);
					setPlace(null);
					setFieldErrors((previous) => ({ ...previous, placeId: undefined }));
				}}
				onSelect={(selected) => {
					setPlace(selected);
					setPlaceQuery(formatPlace(selected));
					setFieldErrors((previous) => ({ ...previous, placeId: undefined }));
					Keyboard.dismiss();
				}}
			/>
			<Button disabled={!isOnline || updateProfile.isPending} onPress={handleSubmit}>
				<Text>Speichern</Text>
			</Button>
			<View className="mt-10 gap-2 border-t border-border pt-4">
				<View className="flex-row items-center justify-between gap-3">
					<Text variant="muted" className="flex-1">
						FoodSwap verlassen?
					</Text>
					<Button
						variant="ghost"
						size="sm"
						disabled={!isOnline || deleteAccount.isPending}
						onPress={confirmDeleteAccount}
					>
						<Text>Konto löschen</Text>
					</Button>
				</View>
				{deleteAccount.isError && (
					<Text className="text-destructive">
						Dein Konto konnte nicht gelöscht werden. Bitte versuche es später noch mal.
					</Text>
				)}
			</View>
		</KeyboardAwareScrollView>
	);
}

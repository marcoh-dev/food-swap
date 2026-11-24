import { formatPlace } from "@food-swap/shared/places";
import { profileSchema, type ProfileValues } from "@food-swap/shared/schemas/user";
import type { Place } from "@food-swap/shared/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard } from "react-native";
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
import { useIsOnline } from "@/hooks/useIsOnline";
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
	const router = useRouter();
	const isOnline = useIsOnline();
	const { data: user } = useCurrentUser();
	const { data: profile } = useUser(user?.id);
	const updateProfile = useUpdateProfile(user?.id ?? "");
	const [name, setName] = useState(profile?.name ?? "");
	const [place, setPlace] = useState<Place | null>(user?.place ?? null);
	const [placeQuery, setPlaceQuery] = useState(user?.place ? formatPlace(user.place) : "");
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

	function handleSubmit() {
		if (!isOnline || !user) return;

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
		</KeyboardAwareScrollView>
	);
}

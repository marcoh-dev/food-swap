import { profileSchema } from "@food-swap/shared/schemas/user";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { z } from "zod";

import { OfflineNotice } from "@/components/OfflineNotice";
import { RequireLogin } from "@/components/RequireLogin";
import { ServerErrorNotice } from "@/components/ServerErrorNotice";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useUser } from "@/hooks/useUser";

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
	const [nameError, setNameError] = useState<string>();

	function handleSubmit() {
		if (!isOnline || !user) return;

		const result = profileSchema.safeParse({
			name,
			placeId: user.place?.id ?? "",
			placeQuery: "",
		});
		if (!result.success) {
			setNameError(z.flattenError(result.error).fieldErrors.name?.[0]);
			return;
		}

		updateProfile.mutate({ name: result.data.name }, { onSuccess: () => router.back() });
	}

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="gap-4 p-6"
			contentInsetAdjustmentBehavior="automatic"
			keyboardShouldPersistTaps="handled"
		>
			{!isOnline && (
				<OfflineNotice message="Du kannst dein Profil bearbeiten, sobald du wieder online bist." />
			)}
			{isOnline && updateProfile.isError && (
				<ServerErrorNotice message="Dein Profil konnte nicht gespeichert werden. Bitte versuche es später noch mal." />
			)}
			<TextField
				label="Profilname"
				placeholder="z. B. Tomato"
				value={name}
				onChangeText={(value) => {
					setName(value);
					setNameError(undefined);
				}}
				error={nameError}
				returnKeyType="done"
				onSubmitEditing={handleSubmit}
			/>
			<Text variant="muted">Für andere User sichtbar.</Text>
			<Button disabled={!isOnline || updateProfile.isPending} onPress={handleSubmit}>
				<Text>Speichern</Text>
			</Button>
		</ScrollView>
	);
}

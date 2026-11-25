import {
	REGISTRATION_RATE_LIMITED_MESSAGE,
	USERNAME_UNAVAILABLE_MESSAGE,
} from "@food-swap/shared/messages";
import {
	PASSWORD_HINT,
	registrationSchema,
	type RegistrationValues,
	USERNAME_HINT,
} from "@food-swap/shared/schemas/user";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Pressable, ScrollView, View } from "react-native";
import { z } from "zod";

import { isConflictError, isRateLimitedError } from "@/api/request";
import { OfflineNotice } from "@/components/OfflineNotice";
import { PasswordField } from "@/components/PasswordField";
import { ServerErrorNotice } from "@/components/ServerErrorNotice";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useRegister } from "@/hooks/useRegister";
import { isAccountTab } from "@/lib/routes";

type FieldErrors = Partial<Record<keyof RegistrationValues, string[]>>;

export default function Registration() {
	const router = useRouter();
	const { redirect } = useLocalSearchParams();
	const registration = useRegister();
	const isOnline = useIsOnline();
	const [values, setValues] = useState<RegistrationValues>({ username: "", password: "" });
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

	// A taken username belongs to its field; too many attempts get a text below the fields;
	// anything else shows the server error notice
	const usernameError = isConflictError(registration.error)
		? USERNAME_UNAVAILABLE_MESSAGE
		: fieldErrors.username?.[0];
	const rateLimited = isRateLimitedError(registration.error);
	const serverError =
		registration.isError && !rateLimited && !isConflictError(registration.error);

	useEffect(() => {
		if (rateLimited)
			AccessibilityInfo.announceForAccessibility(REGISTRATION_RATE_LIMITED_MESSAGE);
	}, [rateLimited]);

	function update(field: keyof RegistrationValues, value: string) {
		setValues((previous) => ({ ...previous, [field]: value }));
		setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
		if (registration.isError) {
			registration.reset();
		}
	}

	function handleSubmit() {
		if (!isOnline) {
			return;
		}

		const result = registrationSchema.safeParse(values);
		if (!result.success) {
			setFieldErrors(z.flattenError(result.error).fieldErrors);
			return;
		}

		registration.mutate(result.data, {
			onSuccess: () => {
				// The visible toast comes with #183
				AccessibilityInfo.announceForAccessibility(
					"Registrierung erfolgreich! Willkommen bei FoodSwap.",
				);
				router.back();
				if (isAccountTab(redirect)) {
					router.navigate(redirect);
				}
			},
		});
	}

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="gap-4 p-6"
			contentInsetAdjustmentBehavior="automatic"
			keyboardShouldPersistTaps="handled"
		>
			<Text variant="h2">Erstelle ein Konto und tausche deine Ernte.</Text>
			{!isOnline && (
				<OfflineNotice message="Du kannst dich registrieren, sobald du wieder online bist." />
			)}
			{isOnline && serverError && (
				<ServerErrorNotice message="Die Registrierung hat nicht geklappt. Bitte versuche es später erneut." />
			)}
			<TextField
				label="Benutzername"
				description={USERNAME_HINT}
				placeholder="Pomodoro"
				value={values.username}
				onChangeText={(value) => update("username", value)}
				error={usernameError}
				autoCapitalize="none"
				autoCorrect={false}
				autoComplete="username-new"
				textContentType="username"
			/>
			<PasswordField
				label="Passwort"
				description={PASSWORD_HINT}
				placeholder="********"
				value={values.password}
				onChangeText={(value) => update("password", value)}
				error={fieldErrors.password?.[0]}
				autoComplete="new-password"
				textContentType="newPassword"
				returnKeyType="go"
				onSubmitEditing={handleSubmit}
			/>
			{rateLimited && (
				<Text className="text-destructive" accessibilityRole="alert">
					{REGISTRATION_RATE_LIMITED_MESSAGE}
				</Text>
			)}
			<Button disabled={!isOnline || registration.isPending} onPress={handleSubmit}>
				<Text>Registrieren</Text>
			</Button>
			{/* The link is its own element: a larger tap target, and its underline doesn't depend on
			    how text nested in another text is styled */}
			<View className="flex-row flex-wrap items-baseline">
				<Text className="text-body-small">
					{"Du hast schon ein Konto? Hier geht's zum "}
				</Text>
				<Pressable
					accessibilityRole="link"
					hitSlop={8}
					// Replaces this modal, so closing the login leads back to where the user came from
					onPress={() =>
						router.replace(
							isAccountTab(redirect) ? `/login?redirect=${redirect}` : "/login",
						)
					}
				>
					<Text className="text-body-small underline">Login</Text>
				</Pressable>
				<Text className="text-body-small">.</Text>
			</View>
		</ScrollView>
	);
}

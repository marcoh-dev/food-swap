import { LOGIN_FAILED_MESSAGE, LOGIN_RATE_LIMITED_MESSAGE } from "@food-swap/shared/messages";
import { loginSchema, type LoginValues } from "@food-swap/shared/schemas/user";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AccessibilityInfo, ScrollView } from "react-native";
import { z } from "zod";

import { isRateLimitedError, isUnauthorizedError } from "@/api/request";
import { OfflineNotice } from "@/components/OfflineNotice";
import { PasswordField } from "@/components/PasswordField";
import { ServerErrorNotice } from "@/components/ServerErrorNotice";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useIsOnline } from "@/hooks/useIsOnline";
import { useLogin } from "@/hooks/useLogin";
import { isAccountTab } from "@/lib/routes";

type FieldErrors = Partial<Record<keyof LoginValues, string[]>>;

export default function Login() {
	const router = useRouter();
	const { redirect } = useLocalSearchParams();
	const login = useLogin();
	const isOnline = useIsOnline();
	const [values, setValues] = useState<LoginValues>({ username: "", password: "" });
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

	// Errors the user can do something about; anything else shows the server error notice
	const loginErrorMessage = isUnauthorizedError(login.error)
		? LOGIN_FAILED_MESSAGE
		: isRateLimitedError(login.error)
			? LOGIN_RATE_LIMITED_MESSAGE
			: null;

	useEffect(() => {
		if (loginErrorMessage) {
			AccessibilityInfo.announceForAccessibility(loginErrorMessage);
		}
	}, [loginErrorMessage]);

	function update(field: keyof LoginValues, value: string) {
		setValues((previous) => ({ ...previous, [field]: value }));
		setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
		if (login.isError) {
			login.reset();
		}
	}

	function handleSubmit() {
		if (!isOnline) {
			return;
		}

		const result = loginSchema.safeParse(values);
		if (!result.success) {
			setFieldErrors(z.flattenError(result.error).fieldErrors);
			return;
		}

		login.mutate(result.data, {
			onSuccess: () => {
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
			<Text variant="h2">Schön, dass du da bist!</Text>
			{!isOnline && (
				<OfflineNotice message="Du kannst dich anmelden, sobald du wieder online bist." />
			)}
			{isOnline && login.isError && !loginErrorMessage && (
				<ServerErrorNotice message="Die Anmeldung hat nicht geklappt. Bitte versuche es später erneut." />
			)}
			<TextField
				label="Benutzername"
				placeholder="Pomodoro"
				value={values.username}
				onChangeText={(value) => update("username", value)}
				error={fieldErrors.username?.[0]}
				autoCapitalize="none"
				autoCorrect={false}
				autoComplete="username"
				textContentType="username"
			/>
			<PasswordField
				label="Passwort"
				placeholder="********"
				value={values.password}
				onChangeText={(value) => update("password", value)}
				error={fieldErrors.password?.[0]}
				autoComplete="current-password"
				textContentType="password"
				returnKeyType="go"
				onSubmitEditing={handleSubmit}
			/>
			{loginErrorMessage && (
				<Text className="text-destructive" accessibilityRole="alert">
					{loginErrorMessage}
				</Text>
			)}
			<Button disabled={!isOnline || login.isPending} onPress={handleSubmit}>
				<Text>Anmelden</Text>
			</Button>
		</ScrollView>
	);
}

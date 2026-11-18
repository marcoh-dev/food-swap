import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { z } from "zod";

import { isUnauthorizedError } from "@/api/request";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useLogin } from "@/hooks/useLogin";
import { isAccountTab } from "@/lib/routes";
import { loginSchema, type LoginValues } from "@/lib/schemas/user.schemas";

type FieldErrors = Partial<Record<keyof LoginValues, string[]>>;

export default function Login() {
	const router = useRouter();
	const { redirect } = useLocalSearchParams();
	const login = useLogin();
	const [values, setValues] = useState<LoginValues>({ username: "", password: "" });
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

	function update(field: keyof LoginValues, value: string) {
		setValues((previous) => ({ ...previous, [field]: value }));
		setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
	}

	function handleSubmit() {
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
			<TextField
				label="Passwort"
				placeholder="********"
				value={values.password}
				onChangeText={(value) => update("password", value)}
				error={fieldErrors.password?.[0]}
				secureTextEntry
				autoComplete="current-password"
				textContentType="password"
				returnKeyType="go"
				onSubmitEditing={handleSubmit}
			/>
			{login.isError ? (
				<Text className="text-destructive">
					{isUnauthorizedError(login.error)
						? "Anmeldung fehlgeschlagen. Benutzername oder Passwort ist falsch."
						: "Anmeldung fehlgeschlagen. Bitte versuche es später erneut."}
				</Text>
			) : null}
			<Button disabled={login.isPending} onPress={handleSubmit}>
				<Text>Anmelden</Text>
			</Button>
		</ScrollView>
	);
}

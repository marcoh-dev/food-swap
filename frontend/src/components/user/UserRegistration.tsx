"use client";

import {
	PASSWORD_HINT,
	registrationSchema,
	type RegistrationValues,
	USERNAME_HINT,
} from "@food-swap/shared/schemas/user";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

import { registerAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { applyServerErrors } from "@/utils/form";

import PinInput from "./PinInput";

export function UserRegistration({ redirectTo }: { redirectTo?: string }) {
	const form = useForm<RegistrationValues>({
		resolver: zodResolver(registrationSchema),
		defaultValues: { username: "", password: "" },
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	const loginHref = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login";

	async function handleSubmit(values: RegistrationValues) {
		const result = await registerAction(values, redirectTo);
		applyServerErrors(form.setError, result);
	}

	return (
		<>
			<form className="mt-4" noValidate onSubmit={form.handleSubmit(handleSubmit)}>
				<FieldGroup>
					<Controller
						name="username"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="username">Benutzername</FieldLabel>
								<Input
									{...field}
									id="username"
									type="text"
									placeholder="Pomodoro"
									required
									autoComplete="username"
									autoCapitalize="off"
									autoCorrect="off"
									aria-invalid={fieldState.invalid}
									aria-describedby={
										fieldState.invalid
											? "username-hint username-error"
											: "username-hint"
									}
								/>
								<FieldDescription id="username-hint">
									{USERNAME_HINT}
								</FieldDescription>
								<FieldError id="username-error" errors={[fieldState.error]} />
							</Field>
						)}
					/>
					<Controller
						name="password"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="password">Passwort</FieldLabel>
								<PinInput
									{...field}
									id="password"
									autoComplete="new-password"
									placeholder="********"
									required
									aria-invalid={fieldState.invalid}
									aria-describedby={
										fieldState.invalid
											? "password-hint password-error"
											: "password-hint"
									}
								/>
								<FieldDescription id="password-hint">
									{PASSWORD_HINT}
								</FieldDescription>
								<FieldError id="password-error" errors={[fieldState.error]} />
							</Field>
						)}
					/>
				</FieldGroup>

				<FieldError className="mt-3" errors={[form.formState.errors.root]} />

				<Button type="submit" className="mt-3" disabled={form.formState.isSubmitting}>
					Registrieren
				</Button>
			</form>
			<div className="text-[10px] font-light">
				Du hast schon ein Konto? Hier geht&apos;s zum{" "}
				<Link href={loginHref} className="underline">
					Login
				</Link>
				.
			</div>
		</>
	);
}

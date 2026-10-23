"use client";

import { loginAction } from "@/app/actions";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/schemas/user.schemas";
import { applyServerErrors } from "@/utils/form";
import { FieldGroup, Field, FieldLabel, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import PinInput from "../PinInput";

export function UserLogin({ redirectTo }: { redirectTo?: string }) {
	const form = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { username: "", password: "" },
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	const registrationHref = redirectTo
		? `/registration?redirect=${encodeURIComponent(redirectTo)}`
		: "/registration";

	async function handleSubmit(values: LoginValues) {
		const result = await loginAction(values, redirectTo);
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
									autoFocus
									autoCapitalize="off"
									autoCorrect="off"
									aria-invalid={fieldState.invalid}
									aria-describedby={
										fieldState.invalid ? "username-error" : undefined
									}
								/>
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
									autoComplete="current-password"
									placeholder="********"
									required
									aria-invalid={fieldState.invalid}
									aria-describedby={
										fieldState.invalid ? "password-error" : undefined
									}
								/>
								<FieldError id="password-error" errors={[fieldState.error]} />
							</Field>
						)}
					/>
				</FieldGroup>

				<FieldError className="mt-3" errors={[form.formState.errors.root]} />

				<Button type="submit" className="mt-3" disabled={form.formState.isSubmitting}>
					Anmelden
				</Button>
			</form>
			<div className="font-light text-[10px]">
				Neu bei FoodSwap? Hier geht&apos;s zur{" "}
				<Link href={registrationHref} className="underline">
					Registrierung
				</Link>
				.
			</div>
		</>
	);
}

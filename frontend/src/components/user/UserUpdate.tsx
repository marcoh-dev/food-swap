"use client";

import { updateUserAction } from "@/app/actions";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileValues } from "@/lib/schemas/user.schemas";
import { applyServerErrors } from "@/utils/form";
import { FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function UserUpdate({ currentName }: { currentName?: string }) {
	const form = useForm<ProfileValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: { name: currentName ?? "" },
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	async function handleSubmit(values: ProfileValues) {
		const result = await updateUserAction(values);
		applyServerErrors(form.setError, result);
	}

	return (
		<section className="mt-8">
			<form className="my-4" noValidate onSubmit={form.handleSubmit(handleSubmit)}>
				<FieldGroup>
					<Controller
						name="name"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="name">Profilname</FieldLabel>
								<FieldDescription>Für andere User sichtbar.</FieldDescription>
								<Input
									{...field}
									id="name"
									type="text"
									placeholder="z. B. Tomato "
									required
									aria-invalid={fieldState.invalid}
									aria-describedby={fieldState.invalid ? "name-error" : undefined}
								/>
								<FieldError id="name-error" errors={[fieldState.error]} />
							</Field>
						)}
					/>
				</FieldGroup>

				<FieldError className="mt-3" errors={[form.formState.errors.root]} />

				<Button type="submit" className="mt-3" disabled={form.formState.isSubmitting}>
					Speichern
				</Button>
			</form>
		</section>
	);
}

"use client";

import { updateUserAction } from "@/app/actions";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileValues } from "@/lib/schemas/user.schemas";
import { applyServerErrors } from "@/utils/form";
import { FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import PlaceCombobox from "../places/PlaceCombobox";
import type { Place } from "@/lib/types/place.types";
import { formatPlace } from "@/utils/place";

export function UserUpdate({
	currentName,
	currentPlace,
}: {
	currentName?: string;
	currentPlace?: Place | null;
}) {
	const form = useForm<ProfileValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: currentName ?? "",
			placeId: currentPlace?.id ?? "",
			placeQuery: currentPlace ? formatPlace(currentPlace) : "",
		},
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	function handlePlaceQueryChange(query: string) {
		form.setValue("placeQuery", query);
		if (form.formState.isSubmitted) form.trigger("placeId");
	}

	async function handleSubmit(values: ProfileValues) {
		const result = await updateUserAction(values);
		applyServerErrors(form.setError, result);
	}

	return (
		<section className="mt-2">
			<form className="my-1" noValidate onSubmit={form.handleSubmit(handleSubmit)}>
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
					<Controller
						name="placeId"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel>Ort</FieldLabel>
								<FieldDescription>
									Wird beim Erstellen eines Angebots vorausgefüllt. Nur für dich
									sichtbar.
								</FieldDescription>
								<PlaceCombobox
									ref={field.ref}
									name={field.name}
									label="Ort"
									defaultPlace={currentPlace}
									placeholder="PLZ oder Ort"
									withPostalCode
									aria-invalid={fieldState.invalid}
									aria-describedby={
										fieldState.invalid ? "placeId-error" : undefined
									}
									onPlaceChange={(place) => field.onChange(place?.id ?? "")}
									onQueryChange={handlePlaceQueryChange}
								/>
								<FieldError id="placeId-error" errors={[fieldState.error]} />
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

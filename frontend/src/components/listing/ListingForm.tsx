"use client";

import { Controller, useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createListingSchema, type ListingFormValues } from "@/lib/schemas/listing.schemas";
import type { Category } from "@/lib/types/category.types";
import type { FormState } from "@/lib/types/common.types";
import type { Place } from "@/lib/types/place.types";
import type { Tag } from "@/lib/types/tag.types";
import { applyServerErrors } from "@/utils/form";
import { Field, FieldLabel, FieldGroup, FieldSet, FieldLegend, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Textarea } from "../ui/textarea";
import TagSelect from "./TagSelect";
import EndDatePicker from "./EndDatePicker";
import PlaceCombobox from "../places/PlaceCombobox";

type Props = {
	action: (values: ListingFormValues) => Promise<FormState>;
	categories: Category[];
	tags: Tag[];
	defaultValues?: ListingFormValues;
	defaultPlace?: Place | null;
	submitLabel?: string;
	autoFocus?: boolean;
	heading?: string;
};

const emptyValues = {
	title: "",
	description: "",
	image: "",
	placeId: "",
	categoryId: "",
	tagIds: [],
	endDate: "",
};

export default function ListingForm({
	action,
	categories,
	tags,
	defaultValues,
	defaultPlace,
	submitLabel = "Erstellen",
	autoFocus,
	heading,
}: Props) {
	const formRef = useRef<HTMLFormElement>(null);

	const form = useForm<ListingFormValues>({
		resolver: zodResolver(createListingSchema(defaultValues?.endDate)),
		defaultValues: defaultValues ?? emptyValues,
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	useEffect(() => {
		if (!autoFocus) return;
		formRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
		(document.getElementById("listing-form-heading") as HTMLHeadingElement | null)?.focus({
			preventScroll: true,
		});
	}, [autoFocus, form]);

	async function handleSubmit(values: ListingFormValues) {
		const result = await action(values);
		applyServerErrors(form.setError, result);
	}

	return (
		<form
			className="my-4"
			noValidate
			onSubmit={form.handleSubmit(handleSubmit)}
			ref={formRef}
			aria-labelledby={heading ? "listing-form-heading" : undefined}
		>
			{heading && (
				<h3 id="listing-form-heading" tabIndex={-1} className="text-h3 mb-4 outline-none">
					{heading}
				</h3>
			)}
			<FieldGroup>
				<Controller
					name="title"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="title">Name</FieldLabel>
							<Input
								{...field}
								id="title"
								type="text"
								placeholder="Tomaten"
								required
								aria-invalid={fieldState.invalid}
								aria-describedby={fieldState.invalid ? "title-error" : undefined}
							/>
							<FieldError id="title-error" errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					name="description"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="description">Beschreibung</FieldLabel>
							<Textarea
								{...field}
								id="description"
								placeholder="3 Tomaten von meiner Ernte …"
								rows={4}
								required
								aria-invalid={fieldState.invalid}
								aria-describedby={
									fieldState.invalid ? "description-error" : undefined
								}
							/>
							<FieldError id="description-error" errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					name="image"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="image">Bild (URL)</FieldLabel>
							<Input
								{...field}
								id="image"
								type="text"
								placeholder="https://placeholder.png"
								aria-invalid={fieldState.invalid}
								aria-describedby={fieldState.invalid ? "image-error" : undefined}
							/>
							<FieldError id="image-error" errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					name="placeId"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel>Ort</FieldLabel>
							<PlaceCombobox
								ref={field.ref}
								name={field.name}
								label="Ort"
								defaultPlace={defaultPlace}
								placeholder="PLZ oder Ort"
								withPostalCode
								aria-invalid={fieldState.invalid}
								aria-describedby={fieldState.invalid ? "placeId-error" : undefined}
								onPlaceChange={(place) => field.onChange(place?.id ?? "")}
							/>
							<FieldError id="placeId-error" errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					name="categoryId"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="categoryId">Kategorie</FieldLabel>
							<Select
								name={field.name}
								value={field.value}
								onValueChange={field.onChange}
							>
								<SelectTrigger
									ref={field.ref}
									id="categoryId"
									className="w-full"
									onBlur={field.onBlur}
									aria-invalid={fieldState.invalid}
									aria-describedby={
										fieldState.invalid ? "categoryId-error" : undefined
									}
								>
									<SelectValue placeholder="Kategorie wählen" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category.id} value={String(category.id)}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldError id="categoryId-error" errors={[fieldState.error]} />
						</Field>
					)}
				/>
				<Controller
					name="tagIds"
					control={form.control}
					render={({ field }) => (
						<FieldSet>
							<FieldLegend variant="label">Tags</FieldLegend>
							<TagSelect tags={tags} value={field.value} onChange={field.onChange} />
						</FieldSet>
					)}
				/>
				<Controller
					name="type"
					control={form.control}
					render={({ field, fieldState }) => (
						<FieldSet data-invalid={fieldState.invalid}>
							<FieldLegend variant="label">Art</FieldLegend>
							<RadioGroup
								name={field.name}
								value={field.value ?? ""}
								onValueChange={field.onChange}
								aria-invalid={fieldState.invalid}
								aria-describedby={fieldState.invalid ? "type-error" : undefined}
							>
								<Field orientation="horizontal">
									<RadioGroupItem ref={field.ref} value="swap" id="type-swap" />
									<FieldLabel htmlFor="type-swap">Tauschen</FieldLabel>
								</Field>
								<Field orientation="horizontal">
									<RadioGroupItem value="giveaway" id="type-giveaway" />
									<FieldLabel htmlFor="type-giveaway">Verschenken</FieldLabel>
								</Field>
							</RadioGroup>
							<FieldError id="type-error" errors={[fieldState.error]} />
						</FieldSet>
					)}
				/>
				<Controller
					name="endDate"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel>Verfügbar bis</FieldLabel>
							<EndDatePicker
								ref={field.ref}
								value={field.value}
								onChange={field.onChange}
								aria-invalid={fieldState.invalid}
								aria-describedby={fieldState.invalid ? "endDate-error" : undefined}
							/>
							<FieldError id="endDate-error" errors={[fieldState.error]} />
						</Field>
					)}
				/>
			</FieldGroup>
			<FieldError className="mt-4" errors={[form.formState.errors.root]} />
			<Button type="submit" className="mt-6" disabled={form.formState.isSubmitting}>
				{submitLabel}
			</Button>
		</form>
	);
}

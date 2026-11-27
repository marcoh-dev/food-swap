import { formatPlace } from "@food-swap/shared/places";
import { createListingSchema, type ListingFormValues } from "@food-swap/shared/schemas/listing";
import type { Place } from "@food-swap/shared/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { EndDatePicker } from "@/components/EndDatePicker";
import { PlacePicker } from "@/components/PlacePicker";
import { RadioGroup } from "@/components/RadioGroup";
import { RequireLogin } from "@/components/RequireLogin";
import { Select } from "@/components/Select";
import { ServerErrorNotice } from "@/components/ServerErrorNotice";
import { TagSelect } from "@/components/TagSelect";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";
import { cn } from "@/lib/utils";

const EMPTY_VALUES = {
	title: "",
	description: "",
	image: "",
	placeId: "",
	categoryId: "",
	tagIds: [],
	endDate: "",
};

export default function New() {
	return (
		<RequireLogin>
			<NewListingForm />
		</RequireLogin>
	);
}

function NewListingForm() {
	const [place, setPlace] = useState<Place | null>(null);
	const [placeQuery, setPlaceQuery] = useState("");
	const { data: categories = [], isError: categoriesFailed } = useCategories();
	const { data: tags = [], isError: tagsFailed } = useTags();
	const form = useForm<ListingFormValues>({
		resolver: zodResolver(createListingSchema()),
		defaultValues: EMPTY_VALUES,
		mode: "onSubmit",
		reValidateMode: "onChange",
	});

	function onValid(values: ListingFormValues) {
		console.log(values);
	}

	return (
		<View className="flex-1 bg-background">
			<KeyboardAwareScrollView
				className="flex-1 bg-background"
				contentContainerClassName={cn(
					"gap-4 p-6",
					// iOS adds the status bar inset itself (contentInsetAdjustmentBehavior)
					Platform.OS === "android" && "pt-safe-offset-6",
				)}
				contentInsetAdjustmentBehavior="automatic"
				keyboardShouldPersistTaps="handled"
				bottomOffset={160}
			>
				{(categoriesFailed || tagsFailed) && (
					<ServerErrorNotice message="Die Daten konnten nicht geladen werden." />
				)}
				<Controller
					name="title"
					control={form.control}
					render={({ field, fieldState }) => (
						<TextField
							label="Titel"
							placeholder="Tomaten"
							value={field.value}
							onChangeText={field.onChange}
							onBlur={field.onBlur}
							error={fieldState.error?.message}
						/>
					)}
				/>
				<Controller
					name="description"
					control={form.control}
					render={({ field, fieldState }) => (
						<TextField
							label="Beschreibung"
							placeholder="3 Tomaten von meiner Ernte …"
							multiline={true}
							value={field.value}
							onChangeText={field.onChange}
							onBlur={field.onBlur}
							error={fieldState.error?.message}
						/>
					)}
				/>
				<Controller
					name="image"
					control={form.control}
					render={({ field, fieldState }) => (
						<TextField
							label="Bild (URL)"
							placeholder="https://placeholder.png"
							keyboardType="url"
							autoCapitalize="none"
							autoCorrect={false}
							value={field.value}
							onChangeText={field.onChange}
							onBlur={field.onBlur}
							error={fieldState.error?.message}
						/>
					)}
				/>
				<Controller
					name="placeId"
					control={form.control}
					render={({ field, fieldState }) => (
						<PlacePicker
							query={placeQuery}
							selectedPlace={place}
							error={fieldState.error?.message}
							onQueryChange={(value) => {
								setPlaceQuery(value);
								setPlace(null);
								field.onChange("");
							}}
							onSelect={(selected) => {
								setPlace(selected);
								setPlaceQuery(formatPlace(selected));
								field.onChange(selected.id);
								Keyboard.dismiss();
							}}
						/>
					)}
				/>
				<Controller
					name="categoryId"
					control={form.control}
					render={({ field, fieldState }) => (
						<Select
							label="Kategorie"
							placeholder="Kategorie wählen"
							options={categories.map((item) => ({
								value: String(item.id),
								label: item.name,
							}))}
							value={field.value}
							onValueChange={field.onChange}
							error={fieldState.error?.message}
						/>
					)}
				/>
				<Controller
					name="tagIds"
					control={form.control}
					render={({ field }) => (
						<View className="gap-2">
							<Text variant="small">Tags</Text>
							<TagSelect tags={tags} value={field.value} onChange={field.onChange} />
						</View>
					)}
				/>
				<Controller
					name="type"
					control={form.control}
					render={({ field, fieldState }) => (
						<RadioGroup
							label="Ich möchte …"
							options={[
								{ value: "swap", label: "tauschen" },
								{ value: "giveaway", label: "verschenken" },
							]}
							value={field.value ?? ""}
							onValueChange={field.onChange}
							error={fieldState.error?.message}
						/>
					)}
				/>
				<Controller
					name="endDate"
					control={form.control}
					render={({ field, fieldState }) => (
						<EndDatePicker
							label="Verfügbar bis"
							value={field.value}
							onChange={field.onChange}
							error={fieldState.error?.message}
						/>
					)}
				/>
				<Button onPress={() => form.handleSubmit(onValid)()}>
					<Text>Erstellen</Text>
				</Button>
			</KeyboardAwareScrollView>
		</View>
	);
}

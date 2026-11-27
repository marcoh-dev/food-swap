import { createListingSchema, type ListingFormValues } from "@food-swap/shared/schemas/listing";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { RequireLogin } from "@/components/RequireLogin";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

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
				contentContainerClassName="gap-4 p-6"
				contentInsetAdjustmentBehavior="automatic"
				keyboardShouldPersistTaps="handled"
				bottomOffset={160}
			>
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
				<Button onPress={() => form.handleSubmit(onValid)()}>
					<Text>Erstellen</Text>
				</Button>
			</KeyboardAwareScrollView>
		</View>
	);
}

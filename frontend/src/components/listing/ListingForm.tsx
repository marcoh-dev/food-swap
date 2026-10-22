import type { Category } from "@/lib/types/category.types";
import type { NewListing } from "@/lib/types/listing.types";
import type { Tag } from "@/lib/types/tag.types";
import type { Place } from "@/lib/types/place.types";
import { Field, FieldLabel, FieldGroup, FieldSet, FieldLegend } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Textarea } from "../ui/textarea";
import TagSelect from "./TagSelect";
import EndDatePicker from "./EndDatePicker";
import PlaceCombobox from "../places/PlaceCombobox";

type Props = {
	action: (formData: FormData) => void | Promise<void>;
	categories: Category[];
	tags: Tag[];
	defaultValues?: NewListing;
	defaultPlace?: Place | null;
	submitLabel?: string;
	error?: string;
};

export default function ListingForm({
	action,
	categories,
	tags,
	defaultValues,
	defaultPlace,
	submitLabel = "Erstellen",
	error,
}: Props) {
	return (
		<form className="my-4" action={action}>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="title">Name</FieldLabel>
					<Input
						id="title"
						name="title"
						type="text"
						placeholder="Tomaten"
						defaultValue={defaultValues?.title}
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="description">Beschreibung</FieldLabel>
					<Textarea
						id="description"
						name="description"
						placeholder="3 Tomaten von meiner Ernte …"
						rows={4}
						defaultValue={defaultValues?.description}
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="image">Bild(URL)</FieldLabel>
					<Input
						id="image"
						name="image"
						type="text"
						placeholder="https://placeholder.png"
						defaultValue={defaultValues?.image ?? ""}
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="location">Ort</FieldLabel>
					<PlaceCombobox
						id="location"
						name="placeId"
						defaultPlace={defaultValues?.place ?? defaultPlace}
						placeholder="PLZ oder Ort"
						withPostalCode
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="categoryId">Kategorie</FieldLabel>
					<Select
						name="categoryId"
						required
						defaultValue={defaultValues?.categoryId ?? undefined}
					>
						<SelectTrigger id="categoryId" className="w-full">
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
				</Field>
				<FieldSet>
					<FieldLegend variant="label">Tags</FieldLegend>
					<TagSelect tags={tags} defaultValue={defaultValues?.tagIds} />
				</FieldSet>
				<FieldSet>
					<FieldLegend variant="label">Art</FieldLegend>
					<RadioGroup name="type" defaultValue={defaultValues?.type} required>
						<Field orientation="horizontal">
							<RadioGroupItem value="swap" id="type-swap" />
							<FieldLabel htmlFor="type-swap">Tauschen</FieldLabel>
						</Field>
						<Field orientation="horizontal">
							<RadioGroupItem value="giveaway" id="type-giveaway" />
							<FieldLabel htmlFor="type-giveaway">Verschenken</FieldLabel>
						</Field>
					</RadioGroup>
				</FieldSet>
				<Field>
					<FieldLabel>Verfügbar bis</FieldLabel>
					<EndDatePicker defaultValue={defaultValues?.endDate} />
				</Field>
			</FieldGroup>
			{error && (
				<p role="alert" className="mt-4 text-sm text-destructive">
					{error}
				</p>
			)}
			<Button type="submit" className="mt-6">
				{submitLabel}
			</Button>
		</form>
	);
}

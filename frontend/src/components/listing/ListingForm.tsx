import type { Category } from "@/lib/types/category.types";
import type { NewListing } from "@/lib/types/listing.types";
import type { Tag } from "@/lib/types/tag.types";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldSet,
  FieldLegend,
} from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import TagSelect from "./TagSelect";

type Props = {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  tags: Tag[];
  defaultValues?: NewListing;
  submitLabel?: string;
};

export default function ListingForm({
  action,
  categories,
  tags,
  defaultValues,
  submitLabel = "Erstellen",
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
          <Input
            id="location"
            name="location"
            type="text"
            placeholder="Hamburg"
            defaultValue={defaultValues?.location}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="categoryId">Kategorie</FieldLabel>
          <NativeSelect
            id="categoryId"
            name="categoryId"
            required
            defaultValue={defaultValues?.categoryId ?? ""}
          >
            <NativeSelectOption value="" disabled>
              Kategorie wählen
            </NativeSelectOption>
            {categories.map((category) => (
              <NativeSelectOption key={category.id} value={category.id}>
                {category.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <FieldSet>
          <FieldLegend>Tags</FieldLegend>
          <TagSelect tags={tags} defaultValue={defaultValues?.tagIds} />
        </FieldSet>
        <FieldSet>
          <FieldLegend>Art</FieldLegend>
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
      </FieldGroup>
      <Button type="submit" className="mt-6">
        {submitLabel}
      </Button>
    </form>
  );
}

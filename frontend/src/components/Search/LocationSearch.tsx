import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

export default function LocationSearchForm({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="location" className="sr-only">
        Ort
      </FieldLabel>
      <Input
        id="location"
        name="location"
        placeholder="Ort"
        defaultValue={defaultValue}
      />
    </Field>
  );
}

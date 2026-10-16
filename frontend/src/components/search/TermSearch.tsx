import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

export default function TermSearch({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="term" className="sr-only">
        Suchbegriff
      </FieldLabel>
      <Input
        id="term"
        name="term"
        type="search"
        placeholder="Was suchst du?"
        defaultValue={defaultValue}
      />
    </Field>
  );
}

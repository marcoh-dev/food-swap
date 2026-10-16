import { MapPinIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

export default function LocationSearchForm({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  return (
    <InputGroup>
      <InputGroupAddon>
        <MapPinIcon />
      </InputGroupAddon>
      <InputGroupInput
        name="location"
        placeholder="Ort"
        defaultValue={defaultValue}
      />
    </InputGroup>
  );
}

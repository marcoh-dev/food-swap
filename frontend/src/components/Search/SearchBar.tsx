import { searchAction } from "@/app/actions";
import LocationSearch from "./LocationSearch";
import TermSearch from "./TermSearch";
import { FieldGroup } from "../ui/field";
import { Button } from "../ui/button";

export default function SearchBar({
  defaultTerm = "",
  defaultLocation = "",
}: {
  defaultTerm?: string;
  defaultLocation?: string;
}) {
  return (
    <form role="search" className="pb-6" action={searchAction}>
      <FieldGroup>
        <TermSearch defaultValue={defaultTerm} />
        <LocationSearch defaultValue={defaultLocation} />
        <Button type="submit">Suchen</Button>
      </FieldGroup>
    </form>
  );
}

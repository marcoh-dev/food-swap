import { searchListingAction } from "@/app/actions";
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
		<form role="search" className="pb-6" action={searchListingAction}>
			<FieldGroup className="gap-2 sm:flex-row sm:items-center">
				<TermSearch defaultValue={defaultTerm} />
				<LocationSearch defaultValue={defaultLocation} />
				<Button type="submit" className="sm:w-auto">
					Suchen
				</Button>
			</FieldGroup>
		</form>
	);
}

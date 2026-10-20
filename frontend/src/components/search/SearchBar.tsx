import { searchListingAction } from "@/app/actions";
import LocationSearch from "./LocationSearch";
import TermSearch from "./TermSearch";
import { FieldGroup } from "../ui/field";
import { Button } from "../ui/button";

export default function SearchBar({
	defaultTerm = "",
	defaultLocation = "",
	category,
	tags,
}: {
	defaultTerm?: string;
	defaultLocation?: string;
	category?: string;
	tags?: string;
}) {
	return (
		<form role="search" className="pb-6" action={searchListingAction}>
			{category && <input type="hidden" name="category" value={category} />}
			{tags && <input type="hidden" name="tags" value={tags} />}

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

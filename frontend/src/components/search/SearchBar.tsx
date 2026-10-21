import { searchListingAction } from "@/app/actions";
import LocationRadiusSearch from "./LocationRadiusSearch";
import type { Place } from "@/lib/types/place.types";
import TermSearch from "./TermSearch";
import { FieldGroup } from "../ui/field";
import { Button } from "../ui/button";

export default function SearchBar({
	defaultTerm = "",
	defaultPlace = null,
	defaultRadius,
	category,
	tags,
}: {
	defaultTerm?: string;
	defaultPlace?: Place | null;
	defaultRadius?: number;
	category?: string;
	tags?: string;
}) {
	return (
		<form role="search" className="pb-6" action={searchListingAction}>
			{category && <input type="hidden" name="category" value={category} />}
			{tags && <input type="hidden" name="tags" value={tags} />}

			<FieldGroup className="gap-2 sm:flex-row sm:items-start">
				<TermSearch defaultValue={defaultTerm} />
				<LocationRadiusSearch
					key={`${defaultPlace?.id ?? ""}-${defaultRadius ?? ""}`}
					defaultPlace={defaultPlace}
					defaultRadius={defaultRadius}
				/>
				<Button type="submit" className="sm:w-auto">
					Suchen
				</Button>
			</FieldGroup>
		</form>
	);
}

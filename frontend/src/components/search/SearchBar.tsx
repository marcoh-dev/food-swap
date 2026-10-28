import { searchListingAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { SEARCH_FORM_ID } from "@/lib/constants/listing.constants";
import type { SortOption } from "@/lib/types/listing.types";
import type { Place } from "@/lib/types/place.types";

import LocationRadiusSearch from "./LocationRadiusSearch";
import TermSearch from "./TermSearch";

export default function SearchBar({
	defaultTerm = "",
	defaultPlace = null,
	defaultRadius,
	category,
	tags,
	sort,
	view,
}: {
	defaultTerm?: string;
	defaultPlace?: Place | null;
	defaultRadius?: number;
	category?: string;
	tags?: string;
	sort?: SortOption;
	view?: "grid" | "list";
}) {
	return (
		<form id={SEARCH_FORM_ID} role="search" className="pb-2" action={searchListingAction}>
			{category && <input type="hidden" name="category" value={category} />}
			{tags && <input type="hidden" name="tags" value={tags} />}
			{view && <input type="hidden" name="view" value={view} />}
			<input key={sort} type="hidden" name="sort" defaultValue={sort ?? "newest"} />

			<FieldGroup className="gap-2 sm:flex-row sm:items-start">
				<TermSearch defaultValue={defaultTerm} />
				<LocationRadiusSearch
					key={`${defaultPlace?.slug ?? ""}-${defaultRadius ?? ""}`}
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

import { GiftIcon, MapPinIcon, RepeatIcon } from "lucide-react";
import { ListingResponse } from "@/lib/types/listing.types";

export default function ListingMeta({
	listing,
}: {
	listing: Pick<ListingResponse, "location" | "type">;
}) {
	const TypeIcon = listing.type === "swap" ? RepeatIcon : GiftIcon;

	return (
		<p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
			<span className="inline-flex items-center gap-1">
				<MapPinIcon className="size-4" aria-hidden="true" />
				{listing.location}
			</span>
			<span className="inline-flex items-center gap-1">
				<TypeIcon className="size-4" aria-hidden="true" />
				{listing.type === "swap" ? "Tauschen" : "Verschenken"}
			</span>
		</p>
	);
}

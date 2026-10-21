import { GiftIcon, MapPinIcon, RepeatIcon } from "lucide-react";
import type { ListingResponse } from "@/lib/types/listing.types";
import { cn } from "@/lib/utils";
import ListingDate from "./ListingDate";

export default function ListingMeta({
	listing,
	dateVariant,
	className,
}: {
	listing: Pick<ListingResponse, "location" | "type" | "createdAt">;
	dateVariant?: "relative" | "full";
	className?: string;
}) {
	const TypeIcon = listing.type === "swap" ? RepeatIcon : GiftIcon;

	return (
		<p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm", className)}>
			<span className="inline-flex items-center gap-1">
				<MapPinIcon className="size-4" aria-hidden="true" />
				{listing.location}
			</span>
			<span className="inline-flex items-center gap-1">
				<TypeIcon className="size-4" aria-hidden="true" />
				{listing.type === "swap" ? "Tauschen" : "Verschenken"}
			</span>
			{dateVariant && <ListingDate createdAt={listing.createdAt} variant={dateVariant} />}
		</p>
	);
}

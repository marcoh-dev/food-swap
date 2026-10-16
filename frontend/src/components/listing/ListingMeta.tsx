import { GiftIcon, MapPinIcon, RepeatIcon } from "lucide-react";
import type { ListingResponse } from "@/lib/types/listing.types";
import { cn } from "@/lib/utils";

export default function ListingMeta({
	listing,
	className,
}: {
	listing: Pick<ListingResponse, "location" | "type">;
	className?: string;
}) {
	const TypeIcon = listing.type === "swap" ? RepeatIcon : GiftIcon;

	return (
		<p
			className={cn(
				"flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500",
				className,
			)}
		>
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

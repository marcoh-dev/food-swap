import { GiftIcon, MapPinIcon, RepeatIcon, TimerIcon } from "lucide-react";
import type { ListingResponse } from "@/lib/types/listing.types";
import { cn } from "@/lib/utils";
import ListingDate from "./ListingDate";
import { getDaysUntil, getEndDateLabel } from "@/utils/date";

export default function ListingMeta({
	listing,
	dateVariant,
	className,
}: {
	listing: Pick<ListingResponse, "location" | "type" | "createdAt" | "endDate">;
	dateVariant?: "relative" | "full";
	className?: string;
}) {
	const TypeIcon = listing.type === "swap" ? RepeatIcon : GiftIcon;
	const daysLeft = getDaysUntil(listing.endDate);

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

			{dateVariant && <ListingDate createdAt={listing.createdAt} variant={dateVariant} />}
			<span className="inline-flex items-center gap-1">
				<TimerIcon className="size-4" aria-hidden="true" />
				{getEndDateLabel(daysLeft, listing.endDate)}
			</span>
		</p>
	);
}

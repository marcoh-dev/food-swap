import { GiftIcon, MapPinIcon, NavigationIcon, RepeatIcon, TimerIcon } from "lucide-react";
import type { ListingResponse } from "@/lib/types/listing.types";
import { cn } from "cn";
import ListingDate from "./ListingDate";
import { getDaysUntil, getEndDateLabel } from "@/utils/date";
import { formatDistance, formatPlace } from "@/utils/place";

export default function ListingMeta({
	listing,
	dateVariant,
	className,
}: {
	listing: Pick<ListingResponse, "place" | "type" | "createdAt" | "endDate" | "distance">;
	dateVariant?: "relative" | "full";
	className?: string;
}) {
	const TypeIcon = listing.type === "swap" ? RepeatIcon : GiftIcon;
	const daysLeft = getDaysUntil(listing.endDate);

	return (
		<p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm", className)}>
			<span className="inline-flex items-center gap-1">
				<MapPinIcon className="size-4" aria-hidden="true" />
				{formatPlace(listing.place)}
			</span>
			{listing.distance !== undefined && (
				<span className="inline-flex items-center gap-1">
					<NavigationIcon className="size-4" aria-hidden="true" />
					{formatDistance(listing.distance)}
				</span>
			)}
			<span className="inline-flex items-center gap-1">
				<TypeIcon className="size-4" aria-hidden="true" />
				{listing.type === "swap" ? "Tauschen" : "Verschenken"}
			</span>

			{dateVariant && <ListingDate createdAt={listing.createdAt} variant={dateVariant} />}
			<span className="inline-flex items-center gap-1">
				<TimerIcon className="size-4" aria-hidden="true" />
				{getEndDateLabel(daysLeft, listing.endDate, dateVariant)}
			</span>
		</p>
	);
}

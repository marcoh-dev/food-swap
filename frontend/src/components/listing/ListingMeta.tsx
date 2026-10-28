import { cn } from "cn";
import {
	CircleAlertIcon,
	GiftIcon,
	MapPinIcon,
	NavigationIcon,
	RepeatIcon,
	TimerIcon,
} from "lucide-react";

import type { ListingResponse } from "@/lib/types/listing.types";
import { formatDate, getDaysUntil, getDeletionLabel, getEndDateLabel } from "@/utils/date";
import { formatDistance, formatPlace } from "@/utils/place";

import ListingDate from "./ListingDate";

export default function ListingMeta({
	listing,
	dateVariant,
	showDeletionDate = false,
	compactType = false,
	hideType = false,
	hideEndDate = false,
	className,
}: {
	listing: Pick<ListingResponse, "place" | "type" | "createdAt" | "endDate" | "distance">;
	dateVariant?: "relative" | "full";
	showDeletionDate?: boolean;
	compactType?: boolean;
	hideType?: boolean;
	hideEndDate?: boolean;
	className?: string;
}) {
	const TypeIcon = listing.type === "swap" ? RepeatIcon : GiftIcon;
	const daysLeft = getDaysUntil(listing.endDate);
	const deletionLabel = showDeletionDate ? getDeletionLabel(listing.endDate) : null;

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
			{!hideType && (
				<span className="inline-flex items-center gap-1">
					<TypeIcon className="size-4" aria-hidden="true" />
					<span className={cn(compactType && "sr-only sm:not-sr-only")}>
						{listing.type === "swap" ? "Tauschen" : "Verschenken"}
					</span>
				</span>
			)}

			{dateVariant && <ListingDate createdAt={listing.createdAt} variant={dateVariant} />}
			{!hideEndDate && (
				<span className="inline-flex items-center gap-1">
					<TimerIcon className="size-4" aria-hidden="true" />
					{dateVariant === "full"
						? `Bis ${formatDate(listing.endDate)}`
						: getEndDateLabel(daysLeft, listing.endDate, dateVariant)}
				</span>
			)}
			{deletionLabel && (
				<span className="inline-flex basis-full items-center gap-1">
					 <CircleAlertIcon className="size-4 text-destructive" aria-hidden="true" />
					{deletionLabel}
				</span>
			)}
		</p>
	);
}

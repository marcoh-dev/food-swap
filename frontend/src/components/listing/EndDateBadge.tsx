import { TimerIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { endDateRules } from "@/lib/constants/listing.constants";
import type { ListingResponse } from "@/lib/types/listing.types";
import { getDaysUntil, getEndDateLabel } from "@/utils/date";

export default function EndDateBadge({ listing }: { listing: Pick<ListingResponse, "endDate"> }) {
	const daysLeft = getDaysUntil(listing.endDate);

	if (daysLeft < 0 || daysLeft > endDateRules.soonDays) return null;

	return (
		<Badge className="bg-background/90 text-foreground shadow-sm backdrop-blur-sm">
			<TimerIcon aria-hidden="true" />
			{getEndDateLabel(daysLeft, listing.endDate)}
		</Badge>
	);
}

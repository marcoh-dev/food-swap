import { getDaysUntil, getEndDateLabel } from "@food-swap/shared/dates";
import { endDateRules } from "@food-swap/shared/endDate";
import type { ListingResponse } from "@food-swap/shared/types";
import { TimerIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

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

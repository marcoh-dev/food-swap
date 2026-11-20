import { isExpired } from "@food-swap/shared/dates";
import type { ListingResponse } from "@food-swap/shared/types";

import { Badge } from "@/components/ui/badge";

export default function ExpiredBadge({ listing }: { listing: Pick<ListingResponse, "endDate"> }) {
	if (!isExpired(listing.endDate)) return null;

	return <Badge variant="expired">Abgelaufen</Badge>;
}

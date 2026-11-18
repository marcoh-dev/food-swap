import type { ListingResponse } from "@food-swap/shared/types";

import { Badge } from "@/components/ui/badge";
import { isExpired } from "@/utils/date";

export default function ExpiredBadge({ listing }: { listing: Pick<ListingResponse, "endDate"> }) {
	if (!isExpired(listing.endDate)) return null;

	return <Badge variant="expired">Abgelaufen</Badge>;
}

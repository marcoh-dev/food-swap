import type { ListingResponse, ListingStatus } from "@food-swap/shared/types";

import { Badge } from "@/components/ui/badge";
import { statusLabels } from "@/lib/constants/listing.constants";

const badgeStatuses: ListingStatus[] = ["reserved", "deactivated"];

export default function StatusBadge({
	listing,
}: {
	listing: Pick<ListingResponse, "status" | "endDate">;
}) {
	if (!badgeStatuses.includes(listing.status)) return null;

	return <Badge variant="status">{statusLabels[listing.status]}</Badge>;
}

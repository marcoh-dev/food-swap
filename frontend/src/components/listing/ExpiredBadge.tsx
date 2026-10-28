import { Badge } from "@/components/ui/badge";
import type { ListingResponse } from "@/lib/types/listing.types";
import { isExpired } from "@/utils/date";

export default function ExpiredBadge({ listing }: { listing: Pick<ListingResponse, "endDate"> }) {
	if (!isExpired(listing.endDate)) return null;

	return <Badge variant="expired">Abgelaufen</Badge>;
}

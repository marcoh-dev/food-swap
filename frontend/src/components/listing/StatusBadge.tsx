import { Badge } from "@/components/ui/badge";
import { statusLabels } from "@/lib/constants/listing.constants";
import type { ListingResponse, ListingStatus } from "@/lib/types/listing.types";

const badgeStatuses: ListingStatus[] = ["reserved", "deactivated"];

export default function StatusBadge({
	listing,
}: {
	listing: Pick<ListingResponse, "status" | "endDate">;
}) {
	if (!badgeStatuses.includes(listing.status)) return null;

	return <Badge variant="status">{statusLabels[listing.status]}</Badge>;
}

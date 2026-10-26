import type { ListingResponse, ListingStatus } from "@/lib/types/listing.types";
import { Badge } from "../ui/badge";
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

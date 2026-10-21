import type { ListingResponse } from "@/lib/types/listing.types";
import { Badge } from "../ui/badge";
import { isExpired } from "@/utils/date";

export default function StatusBadge({
	listing,
}: {
	listing: Pick<ListingResponse, "status" | "endDate">;
}) {
	if (listing.status !== "reserved" || isExpired(listing.endDate)) return null;

	return <Badge variant="status">Reserviert</Badge>;
}

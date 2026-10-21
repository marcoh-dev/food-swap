import type { ListingStatus } from "@/lib/types/listing.types";
import { Badge } from "../ui/badge";

export default function StatusBadge({ status }: { status: ListingStatus }) {
	if (status !== "reserved") return null;

	return <Badge variant="status">Reserviert</Badge>;
}

import { ListingStatus } from "@/lib/types/listing.types";
import { Badge } from "../ui/badge";

export default function StatusBadge({ status }: { status: ListingStatus }) {
  if (status !== "reserved") return null;

  return <Badge className="bg-amber-200 text-gray-900">Reserviert</Badge>;
}

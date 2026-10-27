import { GiftIcon, RepeatIcon } from "lucide-react";
import type { ListingResponse } from "@/lib/types/listing.types";
import { Badge } from "../ui/badge";

export default function TypeBadge({ listing }: { listing: Pick<ListingResponse, "type"> }) {
	const TypeIcon = listing.type === "swap" ? RepeatIcon : GiftIcon;

	return (
		<Badge className="bg-background/90 text-foreground shadow-sm backdrop-blur-sm">
			<TypeIcon aria-hidden="true" />
			<span className="sr-only sm:not-sr-only">
				{listing.type === "swap" ? "Tauschen" : "Verschenken"}
			</span>
		</Badge>
	);
}

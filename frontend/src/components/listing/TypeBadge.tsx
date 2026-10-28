import { GiftIcon, RepeatIcon } from "lucide-react";

import type { ListingResponse } from "@/lib/types/listing.types";

import { Badge } from "../ui/badge";

export default function TypeBadge({ listing }: { listing: Pick<ListingResponse, "type"> }) {
	const TypeIcon = listing.type === "swap" ? RepeatIcon : GiftIcon;

	return (
		<Badge className="shrink-0 bg-background/90 text-foreground shadow-sm backdrop-blur-sm">
			<TypeIcon aria-hidden="true" />
			{/* Label only when the image (nearest @container) is wide enough */}
			<span className="sr-only @3xs:not-sr-only">
				{listing.type === "swap" ? "Tauschen" : "Verschenken"}
			</span>
		</Badge>
	);
}

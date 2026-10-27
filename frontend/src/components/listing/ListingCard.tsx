import Link from "next/link";
import Image from "next/image";
import ListingImagePlaceholder from "@/components/listing/ListingImagePlaceholder";
import CategoryBadge from "@/components/listing/CategoryBadge";
import StatusBadge from "@/components/listing/StatusBadge";
import TagList from "@/components/listing/TagList";
import ListingMeta from "@/components/listing/ListingMeta";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ListingResponse } from "@/lib/types/listing.types";

export default function ListingCard({ listing }: { listing: ListingResponse }) {
	return (
		<Link href={`/listings/${listing.id}`} className="block h-full no-underline">
			<Card className="h-full overflow-hidden pt-0">
				<div className="relative aspect-[16/9] w-full overflow-hidden">
					{listing.image ? (
						<Image
							src={listing.image}
							alt={listing.title}
							width={250}
							height={200}
							className="h-full w-full object-cover"
						/>
					) : (
						<ListingImagePlaceholder />
					)}
					<div className="absolute top-2 left-2">
						<StatusBadge listing={listing} />
					</div>
				</div>
				<CardHeader>
					<CardTitle className="text-h2">{listing.title}</CardTitle>
					<CardDescription>
						<ListingMeta listing={listing} dateVariant="relative" className="text-xs" />
					</CardDescription>
					<div className="flex flex-wrap items-center gap-1.5 justify-self-start">
						<CategoryBadge category={listing.category} />
						<TagList tags={listing.tags} max={2} />
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-xs">{listing.description}</p>
				</CardContent>
			</Card>
		</Link>
	);
}

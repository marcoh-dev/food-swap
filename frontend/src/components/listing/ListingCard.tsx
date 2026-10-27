import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import ListingImagePlaceholder from "@/components/listing/ListingImagePlaceholder";
import CategoryBadge from "@/components/listing/CategoryBadge";
import StatusBadge from "@/components/listing/StatusBadge";
import ExpiredBadge from "@/components/listing/ExpiredBadge";
import TagList from "@/components/listing/TagList";
import ListingMeta from "@/components/listing/ListingMeta";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import type { ListingResponse } from "@/lib/types/listing.types";

type ListingCardProps = { listing: ListingResponse; showExpired?: boolean; actions?: ReactNode };

export default function ListingCard({ listing, showExpired = false, actions }: ListingCardProps) {
	return (
		<Card className="h-full overflow-hidden pt-0">
			<Link
				href={`/listings/${listing.id}`}
				className="flex flex-1 flex-col gap-(--card-spacing) no-underline"
			>
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
					<div className="absolute top-2 left-2 flex flex-col items-start gap-1">
						{showExpired && <ExpiredBadge listing={listing} />}
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
			</Link>
			{actions && (
				<CardFooter className="relative z-20 flex-col items-stretch">{actions}</CardFooter>
			)}
		</Card>
	);
}

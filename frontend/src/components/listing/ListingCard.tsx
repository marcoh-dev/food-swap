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
import { cn } from "cn";

type ListingCardProps = {
	listing: ListingResponse;
	variant?: "grid" | "list";
	showExpired?: boolean;
	actions?: ReactNode;
};

export default function ListingCard({
	listing,
	variant = "grid",
	showExpired = false,
	actions,
}: ListingCardProps) {
	const isList = variant === "list";
	return (
		<Card className={cn("h-full overflow-hidden", isList ? "py-0" : "pt-0")}>
			<Link
				href={`/listings/${listing.id}`}
				className={cn(
					"flex flex-1 no-underline",
					isList ? "flex-row" : "flex-col gap-(--card-spacing)",
				)}
			>
				<div
					className={cn(
						"relative overflow-hidden",
						isList
							? "aspect-square w-28 shrink-0 sm:w-40"
							: "aspect-square w-full sm:aspect-[4/3] lg:aspect-video",
					)}
				>
					{listing.image ? (
						<Image
							src={listing.image}
							alt={listing.title}
							fill
							sizes="(min-width: 768px) 50vw, 50vw"
							className="object-cover"
						/>
					) : (
						<ListingImagePlaceholder />
					)}
					<div className="absolute top-2 left-2 flex flex-col items-start gap-1">
						{showExpired && <ExpiredBadge listing={listing} />}
						<StatusBadge listing={listing} />
					</div>
				</div>
				<div className={cn("flex flex-col", isList && "min-w-0 flex-1 py-3")}>
					<CardHeader>
						<CardTitle className="text-h2">{listing.title}</CardTitle>
						<CardDescription>
							<ListingMeta
								listing={listing}
								dateVariant="relative"
								className="text-xs"
							/>
						</CardDescription>
						<div className="flex flex-wrap items-center gap-1.5 justify-self-start">
							<CategoryBadge category={listing.category} />
							<TagList tags={listing.tags} max={2} />
						</div>
					</CardHeader>
					<CardContent>
						<p className={cn("text-xs", isList && "line-clamp-2")}>
							{listing.description}
						</p>
					</CardContent>
				</div>
			</Link>
			{actions && (
				<CardFooter className="relative z-20 flex-col items-stretch">{actions}</CardFooter>
			)}
		</Card>
	);
}

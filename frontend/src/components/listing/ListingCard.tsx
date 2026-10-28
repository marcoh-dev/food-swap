import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import ListingImagePlaceholder from "@/components/listing/ListingImagePlaceholder";
import CategoryBadge from "@/components/listing/CategoryBadge";
import StatusBadge from "@/components/listing/StatusBadge";
import ExpiredBadge from "@/components/listing/ExpiredBadge";
import TypeBadge from "@/components/listing/TypeBadge";
import EndDateBadge from "@/components/listing/EndDateBadge";
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
	variant?: "grid" | "list" | "detail";
	showExpired?: boolean;
	showDeletionDate?: boolean;
	/** Shows the end date in the meta line, in addition to the badge on the image. */
	showEndDate?: boolean;
	/** Greys out the card and marks the listing as no longer available. */
	unavailable?: boolean;
	actions?: ReactNode;
	children?: ReactNode;
	className?: string;
};

export default function ListingCard({
	listing,
	variant = "grid",
	showExpired = false,
	showDeletionDate = false,
	showEndDate = false,
	unavailable = false,
	actions,
	children,
	className,
}: ListingCardProps) {
	const isList = variant === "list";
	const isDetail = variant === "detail";
	const bodyClassName = cn(
		"relative flex flex-1 no-underline",
		isList ? "flex-row" : "flex-col gap-(--card-spacing)",
	);
	const body = (
		<>
			<div
				// Scroll target for ListingActions after saving/cancelling an edit
				id={isDetail ? "listing-image" : undefined}
				className={cn(
					"@container relative overflow-hidden",
					isList
						? "w-2/5 shrink-0 sm:w-40 md:aspect-4/3 md:w-72 lg:w-96"
						: "aspect-square w-full sm:aspect-[4/3] lg:aspect-video",
				)}
			>
				{listing.image ? (
					<Image
						src={listing.image}
						alt={listing.title}
						fill
						sizes={
							isList
								? "(min-width: 1024px) 384px, (min-width: 768px) 288px, (min-width: 640px) 160px, 40vw"
								: isDetail
									? "(min-width: 768px) 672px, 100vw"
									: "(min-width: 768px) 50vw, 100vw"
						}
						className="object-cover"
					/>
				) : (
					<ListingImagePlaceholder />
				)}
				{unavailable && (
					<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
						<span
							className={cn(
								"text-center font-semibold text-white",
								isDetail ? "p-4" : "p-2 text-xs sm:text-sm",
							)}
						>
							Diese Anzeige ist nicht mehr verfügbar.
						</span>
					</div>
				)}
				<div className="absolute inset-x-2 top-2 z-20 flex items-start justify-between gap-1">
					<div className="flex min-w-0 flex-col items-start gap-1">
						{showExpired && <ExpiredBadge listing={listing} />}
						<StatusBadge listing={listing} />
					</div>
					<TypeBadge listing={listing} />
				</div>
				<div className="absolute bottom-2 left-2">
					<EndDateBadge listing={listing} />
				</div>
			</div>
			<div className={cn("flex flex-col gap-3", isList && "min-w-0 flex-1 py-3")}>
				<CardHeader>
					<CardTitle
						className={cn("text-h2 wrap-break-word", !isDetail && "line-clamp-2")}
						title={listing.title}
					>
						{listing.title}
					</CardTitle>
					<CardDescription>
						<ListingMeta
							listing={listing}
							dateVariant={isDetail ? "full" : "relative"}
							showDeletionDate={showDeletionDate}
							hideType
							hideEndDate={!showEndDate}
							className="text-xs"
						/>
					</CardDescription>
					<div className="mt-1 flex min-w-0 flex-col items-start gap-1.5">
						<CategoryBadge category={listing.category} />
						{isDetail ? (
							<TagList tags={listing.tags} />
						) : (
							<TagList
								tags={listing.tags}
								max={isList ? { sm: 2, md: 3, lg: 5 } : { sm: 2, lg: 3 }}
								scrollable
							/>
						)}
					</div>
				</CardHeader>
				<CardContent className={cn(!isDetail && "hidden sm:block")}>
					<p
						className={cn(
							"text-xs wrap-break-word",
							isDetail
								? "whitespace-pre-line"
								: isList
									? "line-clamp-2"
									: "line-clamp-3",
						)}
					>
						{listing.description}
					</p>
					{children}
				</CardContent>
			</div>
			{unavailable && (
				<div
					className={cn(
						"pointer-events-none absolute z-10 bg-gray-500/60",
						// Reach across the card gap up to the footer border / card edge
						isList ? "inset-0" : "inset-x-0 top-0 -bottom-(--card-spacing)",
					)}
				/>
			)}
		</>
	);

	return (
		<Card
			className={cn(
				"h-full overflow-hidden",
				isList ? "gap-0 py-0 max-sm:rounded-none" : "pt-0",
				className,
			)}
		>
			{isDetail ? (
				<div className={bodyClassName}>{body}</div>
			) : (
				<Link href={`/listings/${listing.id}`} className={bodyClassName}>
					{body}
				</Link>
			)}
			{actions && (
				<CardFooter className="relative z-20 flex-col items-stretch">{actions}</CardFooter>
			)}
		</Card>
	);
}

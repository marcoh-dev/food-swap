import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import CategoryBadge from "@/components/listing/CategoryBadge";
import EndDateBadge from "@/components/listing/EndDateBadge";
import ExpiredBadge from "@/components/listing/ExpiredBadge";
import ListingImagePlaceholder from "@/components/listing/ListingImagePlaceholder";
import ListingMeta from "@/components/listing/ListingMeta";
import StatusBadge from "@/components/listing/StatusBadge";
import TagList from "@/components/listing/TagList";
import TypeBadge from "@/components/listing/TypeBadge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ListingResponse } from "@/lib/types/listing.types";

type ListingCardProps = {
	listing: ListingResponse;
	variant?: "grid" | "list" | "detail";
	showExpired?: boolean;
	showDeletionDate?: boolean;
	showEndDate?: boolean;
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
		"relative no-underline",
		isList
			? "col-span-2 col-start-1 row-span-2 row-start-1 grid grid-cols-subgrid grid-rows-subgrid"
			: "flex flex-1 flex-col gap-(--card-spacing)",
	);
	const body = (
		<>
			<div
				id={isDetail ? "listing-image" : undefined}
				className={cn(
					"@container relative overflow-hidden",
					isList
						? // padding spacer instead of aspect-square, so the image still stretches with taller content
							"row-span-2 before:block before:pt-[100%] md:before:pt-[80%]"
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
								? "(min-width: 1024px) 250px, 40vw"
								: isDetail
									? "(min-width: 768px) 672px, 100vw"
									: "(min-width: 1280px) 300px, (min-width: 1024px) 33vw, 50vw"
						}
						className="object-cover"
					/>
				) : (
					<ListingImagePlaceholder />
				)}
				{unavailable && (
					<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-gray-500/60">
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
								max={
									isList
										? { sm: 6, md: 8, lg: 5, xl: 6 }
										: { sm: 5, md: 6, lg: 5 }
								}
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
		</>
	);

	return (
		<Card
			className={cn(
				"h-full overflow-hidden",
				isList
					? "grid grid-cols-[2fr_3fr] grid-rows-[1fr_auto] gap-0 py-0 max-sm:rounded-none"
					: "pt-0",
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
				<CardFooter
					className={cn(
						"relative z-20 flex-col items-stretch",
						isList && "col-start-2 row-start-2",
					)}
				>
					{actions}
				</CardFooter>
			)}
		</Card>
	);
}

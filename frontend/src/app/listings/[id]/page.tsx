import { getPlaceBySlug } from "@/lib/places.service";
import { parseRadius } from "@/lib/constants/listing.constants";
import { getListingById } from "@/lib/listings.service";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ListingActions from "@/components/listing/ListingAction";
import { getCurrentUser } from "@/lib/users.service";
import SearchBar from "@/components/search/SearchBar";
import { getCategories } from "@/lib/categories.service";
import CategoryBadge from "@/components/listing/CategoryBadge";
import { getTags } from "@/lib/tags.service";
import TagList from "@/components/listing/TagList";
import StatusBadge from "@/components/listing/StatusBadge";
import ListingMeta from "@/components/listing/ListingMeta";
import { ListingChat } from "@/components/chat/ListingChat";
import { getListingChatStatus } from "@/lib/chats.service";
import type { ListingChatStatus } from "@/lib/types/chat.types";

import {
	Card,
	CardHeader,
	CardTitle,
	CardAction,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { pageTitles } from "@/lib/constants/titles.constants";
import type { Metadata } from "next";
import ListingImagePlaceholder from "@/components/listing/ListingImagePlaceholder";
import { isExpired } from "@/utils/date";
import ExpiredBadge from "@/components/listing/ExpiredBadge";

export async function generateMetadata({ params }: PageProps<"/listings/[id]">): Promise<Metadata> {
	const { id } = await params;
	const listing = await getListingById(id);

	return {
		title: listing ? listing.title : pageTitles.listingNotFound,
	};
}

export default async function ListingDetailPage({
	params,
	searchParams,
}: PageProps<"/listings/[id]">) {
	const { id } = await params;
	const { term, place, radius, edit } = await searchParams;
	const selectedPlace = typeof place === "string" ? await getPlaceBySlug(place) : null;
	const listing = await getListingById(id);
	const categories = await getCategories();
	const tags = await getTags();
	const currentUser = await getCurrentUser();

	if (!listing) notFound();

	const isOwner = currentUser?.id === listing.owner.id;
	const isListingExpired = isExpired(listing.endDate);
	const isUnavailable = listing.status === "deactivated" || isListingExpired;
	const ownerName = listing.owner.name ?? listing.owner.username;
	const chatStatus: ListingChatStatus | null =
		currentUser && !isOwner
			? await getListingChatStatus(listing.id).catch(() => ({
					chatId: null,
					hidden: false,
				}))
			: null;

	return (
		<>
			<SearchBar
				defaultTerm={typeof term === "string" ? term : undefined}
				defaultPlace={selectedPlace}
				defaultRadius={
					selectedPlace && typeof radius === "string" ? parseRadius(radius) : undefined
				}
			/>
			<Card className="mx-auto w-full max-w-2xl overflow-hidden mt-6 pt-0">
				<div className="relative flex flex-col gap-4 pb-3">
					<div className="relative h-64 w-full sm:h-80 md:h-96">
						{listing.image ? (
							<Image
								src={listing.image}
								alt={listing.title}
								fill
								sizes="(max-width: 768px) 100vw, 672px"
								className="object-cover"
							/>
						) : (
							<ListingImagePlaceholder />
						)}
						<div className="absolute top-2 left-2 z-20 flex flex-col items-start gap-1">
							<ExpiredBadge listing={listing} />
							<StatusBadge listing={listing} />
						</div>
						{isUnavailable && (
							<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
								<span className="p-4 font-semibold text-white">
									Diese Anzeige ist nicht mehr verfügbar.
								</span>
							</div>
						)}
					</div>
					<CardHeader>
						<CardTitle className="text-h2">{listing.title}</CardTitle>
						<CardDescription>
							<ListingMeta listing={listing} dateVariant="full" />
						</CardDescription>
						<p className="text-sm">
							Angeboten von{" "}
							<Link href={`/users/${listing.owner.id}`}>{ownerName}</Link>
						</p>
						<CardAction>
							<CategoryBadge category={listing.category} />
						</CardAction>
					</CardHeader>
					<CardContent className="space-y-4">
						<p>{listing.description}</p>
						<TagList tags={listing.tags} />
					</CardContent>
					{isUnavailable && (
						<div className="pointer-events-none absolute inset-0 z-10 bg-gray-500/60" />
					)}
				</div>

				{isOwner && (
					<CardFooter className="relative z-20 flex-col items-stretch">
						<ListingActions
							listing={listing}
							categories={categories}
							tags={tags}
							initialEditing={edit === "true"}
						/>
					</CardFooter>
				)}

				{chatStatus && (
					<div className="mt-4">
						<ListingChat
							listingId={listing.id}
							ownerId={listing.owner.id}
							ownerName={ownerName}
							status={chatStatus}
						/>
					</div>
				)}
				{!currentUser && (
					<p className="mt-3 ml-4 text-sm">
						<Link href={`/login?redirect=/listings/${listing.id}`}>Anmelden</Link>, um{" "}
						{ownerName} zu schreiben.
					</p>
				)}
			</Card>
		</>
	);
}

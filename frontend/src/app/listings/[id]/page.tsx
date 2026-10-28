import { getPlaceBySlug } from "@/lib/places.service";
import { parseRadius } from "@/lib/constants/listing.constants";
import { getListingById } from "@/lib/listings.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import ListingActions from "@/components/listing/ListingAction";
import { getCurrentUser } from "@/lib/users.service";
import SearchBar from "@/components/search/SearchBar";
import { getCategories } from "@/lib/categories.service";
import { getTags } from "@/lib/tags.service";
import ListingCard from "@/components/listing/ListingCard";
import { ListingChat } from "@/components/chat/ListingChat";
import { getListingChatStatus } from "@/lib/chats.service";
import type { ListingChatStatus } from "@/lib/types/chat.types";
import { pageTitles } from "@/lib/constants/titles.constants";
import type { Metadata } from "next";
import { isExpired } from "@/utils/date";

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
			<ListingCard
				listing={listing}
				variant="detail"
				showExpired
				showDeletionDate={isOwner}
				showEndDate={isOwner}
				unavailable={listing.status === "deactivated" || isExpired(listing.endDate)}
				className="mx-auto mt-6 h-auto w-full max-w-2xl"
				actions={
					<>
						{isOwner && (
							<ListingActions
								listing={listing}
								categories={categories}
								tags={tags}
								initialEditing={edit === "true"}
							/>
						)}
						{chatStatus && (
							<ListingChat
								listingId={listing.id}
								ownerId={listing.owner.id}
								ownerName={ownerName}
								status={chatStatus}
							/>
						)}
						{!currentUser && (
							<p className="text-sm">
								<Link href={`/login?redirect=/listings/${listing.id}`}>
									Anmelden
								</Link>
								, um {ownerName} zu schreiben.
							</p>
						)}
					</>
				}
			>
				<p className="mt-3 text-xs">
					Angeboten von <Link href={`/users/${listing.owner.id}`}>{ownerName}</Link>
				</p>
			</ListingCard>
		</>
	);
}

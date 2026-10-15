import { getListingById } from "@/lib/listings.service";
import { notFound } from "next/navigation";
import Image from "next/image";
import ListingActions from "@/components/ListingAction";
import { getCurrentUser } from "@/lib/users.service";
import Link from "next/link";
import { ListingChat } from "@/components/chat/ListingChat";
import ListingMeta from "@/components/ListingMeta";
import { getListingChatStatus } from "@/lib/chats.service";
import type { ListingChatStatus } from "@/lib/types/chat.types";

export default async function ListingDetailPage({ params }: PageProps<"/listings/[id]">) {
	const { id } = await params;
	const listing = await getListingById(id);
	const currentUser = await getCurrentUser();

	if (!listing) notFound();

	const ownerName = listing.owner.name ?? listing.owner.username;

	const canChat = currentUser !== null && currentUser.id !== listing.owner.id;

	const chatStatus: ListingChatStatus | null = canChat
		? await getListingChatStatus(listing.id).catch(() => ({
				chatId: null,
				hidden: false,
			}))
		: null;

	return (
		<>
			<div className="flex flex-col p-4 bg-gray-200 w-fit">
				<Image
					width={450}
					height={400}
					src={listing.image ?? "/placeholder.png"}
					alt={listing.title}
				></Image>
				<h2 className="text-h2">{listing.title}</h2>
				<p>{listing.description}</p>
				<ListingMeta listing={listing} />
				{currentUser?.id === listing.owner.id && <ListingActions listing={listing} />}
			</div>
			{chatStatus && (
				<div className="mt-4">
					<ListingChat listingId={listing.id} ownerName={ownerName} status={chatStatus} />
				</div>
			)}
			{!currentUser && (
				<p className="mt-4 text-sm">
					<Link href="/login">Anmelden</Link>, um {ownerName} zu schreiben.
				</p>
			)}
		</>
	);
}

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

export default async function ListingDetailPage({
  params,
  searchParams,
}: PageProps<"/listings/[id]">) {
  const { id } = await params;
  const { term, location } = await searchParams;
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
        defaultLocation={typeof location === "string" ? location : undefined}
      />
      <div className="flex flex-col p-4 bg-gray-200 w-fit">
        <Image
          width={450}
          height={400}
          src={listing.image ?? "/placeholder.png"}
          alt={listing.title}
        ></Image>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h2 className="text-h2">{listing.title}</h2>
          <CategoryBadge category={listing.category} />
        </div>
        <StatusBadge status={listing.status} />
        <p>{listing.description}</p>
        <ListingMeta listing={listing} />
        <TagList tags={listing.tags} />
        {listing.status === "deactivated" && (
          <div className="absolute -inset-2 flex items-center justify-center bg-gray-500/60">
            <span className="font-semibold text-white p-4">
              Diese Anzeige ist nicht mehr verfügbar.
            </span>
          </div>
        )}
        {isOwner && (
          <ListingActions
            listing={listing}
            categories={categories}
            tags={tags}
          />
        )}
      </div>
      {chatStatus && (
        <div className="mt-4">
          <ListingChat
            listingId={listing.id}
            ownerName={ownerName}
            status={chatStatus}
          />
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

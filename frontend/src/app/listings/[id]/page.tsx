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
      <Card className="mx-auto w-full max-w-2xl overflow-hidden pt-0">
        <div className="relative flex flex-col gap-4 pb-3">
          <div className="relative h-64 w-full sm:h-80 md:h-96">
            <Image
              src={listing.image ?? "/placeholder.png"}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
            />
            <div className="absolute top-2 left-2">
              <StatusBadge status={listing.status} />
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-h2">{listing.title}</CardTitle>
            <CardDescription>
              <ListingMeta listing={listing} dateVariant="full" />
            </CardDescription>
            <CardAction>
              <CategoryBadge category={listing.category} />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{listing.description}</p>
            <TagList tags={listing.tags} />
          </CardContent>

          {listing.status === "deactivated" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-500/60">
              <span className="font-semibold text-white p-4">
                Diese Anzeige ist nicht mehr verfügbar.
              </span>
            </div>
          )}
        </div>

        {isOwner && (
          <CardFooter className="relative z-10 flex-col items-stretch">
            <ListingActions
              listing={listing}
              categories={categories}
              tags={tags}
            />
          </CardFooter>
        )}

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
          <p className="mt-3 ml-4 text-sm">
            <Link href="/login">Anmelden</Link>, um {ownerName} zu schreiben.
          </p>
        )}
      </Card>
    </>
  );
}

import { getListingById } from "@/lib/listings.service";
import { notFound } from "next/navigation";
import Image from "next/image";
import ListingActions from "@/components/listing/ListingAction";
import { getCurrentUser } from "@/lib/users.service";
import SearchBar from "@/components/search/SearchBar";
import { getCategories } from "@/lib/categories.service";
import CategoryBadge from "@/components/listing/CategoryBadge";

export default async function ListingDetailPage({
  params,
  searchParams,
}: PageProps<"/listings/[id]">) {
  const { id } = await params;
  const { term, location } = await searchParams;
  const listing = await getListingById(id);
  const categories = await getCategories();
  const currentUser = await getCurrentUser();

  if (!listing) notFound();

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
          alt="placeholder image"
        ></Image>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h2 className="text-h2">{listing.title}</h2>
          <CategoryBadge category={listing.category} />
        </div>
        <p>{listing.description}</p>
        <p className="text-sm text-gray-500">
          {listing.location} ·{" "}
          {listing.type === "swap" ? "Tauschen" : "Verschenken"}
        </p>
        {currentUser?.id === listing.owner.id && (
          <ListingActions listing={listing} categories={categories} />
        )}
      </div>
    </>
  );
}

import { getListingById } from "@/lib/listings.service";
import { notFound } from "next/navigation";
import Image from "next/image";
import ListingActions from "@/components/ListingAction";
import { getCurrentUser } from "@/lib/users.service";
import SearchBar from "@/components/Search/SearchBar";

export default async function ListingDetailPage({
  params,
}: PageProps<"/listings/[id]">) {
  const { id } = await params;
  const listing = await getListingById(id);
  const currentUser = await getCurrentUser();

  if (!listing) notFound();

  return (
    <>
      <SearchBar />
      <div className="flex flex-col p-4 bg-gray-200 w-fit">
        <Image
          width={450}
          height={400}
          src={listing.image ?? "/placeholder.png"}
          alt="placeholder image"
        ></Image>
        <h2 className="text-h2">{listing.title}</h2>
        <p>{listing.description}</p>
        <p className="text-sm text-gray-500">
          {listing.location} ·{" "}
          {listing.type === "swap" ? "Tauschen" : "Verschenken"}
        </p>
        {currentUser?.id === listing.owner.id && (
          <ListingActions listing={listing} />
        )}
      </div>
    </>
  );
}

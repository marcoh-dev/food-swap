import { getListingById } from "@/lib/listings.service";
import { notFound } from "next/navigation";
import Image from "next/image";
import ListingActions from "@/components/ListingAction";

export default async function ListingDetailPage({
  params,
}: PageProps<"/listings/[id]">) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) notFound();

  return (
    <>
      <div className="flex flex-col p-4 bg-gray-200 w-fit">
        <Image
          width={450}
          height={400}
          src="/placeholder.png"
          alt="placeholder image"
        ></Image>
        <h2 className="font-semibold">{listing.name}</h2>
        <p>{listing.description}</p>
        <p className="text-sm text-gray-500">
          {listing.location} ·{" "}
          {listing.type === "tauschen" ? "Tauschen" : "Verschenken"}
        </p>
        <ListingActions listing={listing} />
      </div>
    </>
  );
}

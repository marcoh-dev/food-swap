import { getListingById } from "@/lib/listings.service";
import { notFound } from "next/navigation";

export default async function ListingDetailPage({
  params,
}: PageProps<"/listings/[id]">) {
  const { id } = await params;

  const listing = await getListingById(id);
  if (!listing) notFound();

  return (
    <div className="my-4">
      <h1 className="font-semibold">{listing.name}</h1>
      <p>{listing.description}</p>
      <p className="text-sm text-gray-500">
        {listing.location} ·{" "}
        {listing.type === "tauschen" ? "Tauschen" : "Verschenken"}
      </p>
    </div>
  );
}

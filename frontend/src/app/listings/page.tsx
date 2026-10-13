import { getListings } from "@/lib/listings.service";
import Link from "next/link";
import Image from "next/image";
import { SearchParams } from "next/dist/server/request/search-params";
import { SortingMenu } from "@/components/SortingMenu";
import { SortOption } from "@/lib/types/listing.types";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Partial<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const sort: SortOption = params.sort === "oldest" ? "oldest" : "newest";
  const listingsData = await getListings({ page, sort });

  return (
    <>
      <div className="flex w-full justify-end mb-2">
        <SortingMenu sort={sort} />
      </div>
      <ul className="grid grid-cols-2 gap-12">
        {listingsData?.data.map((listing) => (
          <li
            key={listing.id}
            className="border-2 border-gray-300 rounded-lg px-3 py-2 basis-1/2 bg-gray-200"
          >
            <Link href={`/listings/${listing.id}`} className="no-underline">
              <div className="aspect-[3/2] w-full overflow-hidden">
                <Image
                  src={listing.image ?? "/placeholder.png"}
                  alt={listing.title}
                  width={250}
                  height={200}
                  className="h-full w-full rounded-lg object-cover"
                />
              </div>
              <h2 className="text-h2 wrap-break-word">{listing.title}</h2>
              <p className="text-sm">{listing.description}</p>
              <p className="text-xs text-gray-500">
                {listing.location} ·{" "}
                {listing.type === "swap" ? "Tauschen" : "Verschenken"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

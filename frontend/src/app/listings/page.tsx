import { getListings } from "@/lib/listings.service";
import Link from "next/link";
import Image from "next/image";
import { SearchParams } from "next/dist/server/request/search-params";
import SearchBar from "@/components/Search/SearchBar";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Partial<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page) | 1;
  const listingsData = await getListings({ page });

  return (
    <>
      <SearchBar />
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
              <h2 className="text-h2">{listing.title}</h2>
              <p className="text-body">{listing.description}</p>
              <p className="text-sm text-gray-500">
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

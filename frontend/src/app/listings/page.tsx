import { getListings } from "@/lib/listings.service";
import Link from "next/link";
import Image from "next/image";
import type { SearchParams } from "next/dist/server/request/search-params";
import SearchBar from "@/components/search/SearchBar";
import { SortingMenu } from "@/components/SortingMenu";
import type { SortOption } from "@/lib/types/listing.types";
import CategoryBadge from "@/components/listing/CategoryBadge";
import StatusBadge from "@/components/listing/StatusBadge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import ListingMeta from "@/components/listing/ListingMeta";

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
      <SearchBar />
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
              <Card className="h-full overflow-hidden pt-0">
                <div className="aspect-[3/2] w-full overflow-hidden">
                  <Image
                    src={listing.image ?? "/placeholder.png"}
                    alt={listing.title}
                    width={250}
                    height={200}
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>

                <CardHeader>
                  <CardTitle className="text-h2">{listing.title}</CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    {listing.location} ·{" "}
                    {listing.type === "swap" ? "Tauschen" : "Verschenken"}
                  </CardDescription>
                  <CardAction>
                    <CategoryBadge category={listing.category} />
                  </CardAction>
                </CardHeader>
                <StatusBadge status={listing.status} />
                <CardContent>
                  <p className="text-sm">{listing.description}</p>
                </CardContent>
              </Card>

              <div className="flex flex-wrap items-center justify-between">
                <h2 className="text-h2">{listing.title}</h2>
                <CategoryBadge category={listing.category} />
              </div>
              <StatusBadge status={listing.status} />
              <p className="text-sm">{listing.description}</p>
              <ListingMeta listing={listing} className="text-xs" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

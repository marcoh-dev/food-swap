import { getListings } from "@/lib/listings.service";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/search/SearchBar";
import { SortingMenu } from "@/components/SortingMenu";
import type { SortOption } from "@/lib/types/listing.types";
import CategoryBadge from "@/components/listing/CategoryBadge";
import StatusBadge from "@/components/listing/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ListingMeta from "@/components/listing/ListingMeta";

export default async function ListingsPage({
  searchParams,
}: PageProps<"/listings">) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const sort: SortOption = params.sort === "oldest" ? "oldest" : "newest";
  const listingsData = await getListings({ page, sort });

  return (
    <>
      <SearchBar />
      {listingsData?.data.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          Keine Angebote gefunden. Versuche, deine Suche oder Filter anzupassen.
        </p>
      ) : (
        <>
          <div className="flex w-full justify-end mb-2">
            <SortingMenu sort={sort} />
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-8 md:gap-12">
            {listingsData?.data.map((listing) => (
              <li key={listing.id}>
                <Link
                  href={`/listings/${listing.id}`}
                  className="block  h-full no-underline"
                >
                  <Card className="h-full overflow-hidden pt-0">
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <Image
                        src={listing.image ?? "/placeholder.png"}
                        alt={listing.title}
                        width={250}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <StatusBadge status={listing.status} />
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-h2">{listing.title}</CardTitle>
                      <CardDescription>
                        <ListingMeta
                          listing={listing}
                          dateVariant="relative"
                          className="text-xs"
                        />
                      </CardDescription>
                      <CategoryBadge category={listing.category} />
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs">{listing.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

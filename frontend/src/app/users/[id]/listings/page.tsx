import CategoryBadge from "@/components/listing/CategoryBadge";
import ListingMeta from "@/components/listing/ListingMeta";
import StatusBadge from "@/components/listing/StatusBadge";
import SearchBar from "@/components/search/SearchBar";
import { SortingMenu } from "@/components/SortingMenu";
import { getUserListings } from "@/lib/listings.service";
import type { SortOption } from "@/lib/types/listing.types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function UserListingsPage({
  params,
  searchParams,
}: PageProps<"/users/[id]/listings">) {
  const { id: userId } = await params;
  const query = await searchParams;

  const page = Number(query.page) || 1;
  const sort: SortOption = query.sort === "oldest" ? "oldest" : "newest";

  const listingsData = await getUserListings({ userId, page, sort });

  if (!listingsData) {
    notFound();
  }

  return (
    <>
      <SearchBar />
      {listingsData.data.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          Dieser User hat aktuell keine Anzeigen.
        </p>
      ) : (
        <>
          <div className="flex w-full justify-end mb-2">
            <SortingMenu sort={sort} />
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-8 md:gap-12">
            {listingsData.data.map((listing) => (
              <li key={listing.id}>
                <Link
                  href={`/listings/${listing.id}`}
                  className="block h-full no-underline"
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

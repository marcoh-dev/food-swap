import { getListings } from "@/lib/listings.service";
import Link from "next/link";
import Image from "next/image";
import type { SearchParams } from "next/dist/server/request/search-params";
import SearchBar from "@/components/search/SearchBar";
import { SortingMenu } from "@/components/SortingMenu";
import type { SortOption } from "@/lib/types/listing.types";
import CategoryBadge from "@/components/listing/CategoryBadge";
import StatusBadge from "@/components/listing/StatusBadge";
import ListingMeta from "@/components/listing/ListingMeta";
import ListingFilters from "@/components/listing/ListingFilter";
import { getCategories } from "@/lib/categories.service";
import { getTags } from "@/lib/tags.service";

function getParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value !== "") {
    return value;
  }
  return undefined;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Partial<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const sort: SortOption = params.sort === "oldest" ? "oldest" : "newest";
  const term = getParam(params.term);
  const location = getParam(params.location);
  const category = getParam(params.category);
  const tags = getParam(params.tags);

  const [listingsData, categories, allTags] = await Promise.all([
    getListings({ page, sort, term, location, category, tags }),
    getCategories(),
    getTags(),
  ]);
  const listings = listingsData?.data ?? [];

  return (
    <>
      <SearchBar defaultTerm={term} defaultLocation={location} />
      <div className="flex w-full items-start justify-between mb-2">
        <ListingFilters categories={categories} tags={allTags} />
        <SortingMenu sort={sort} />
      </div>

      {listings.length === 0 ? (
        <p className="my-8 text-center text-gray-500">
          Keine Angebote passen zu deine Filtern.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-12">
          {listings.map((listing) => (
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

                <div className="flex flex-wrap items-center justify-between">
                  <h2 className="text-h2">{listing.title}</h2>
                  <CategoryBadge category={listing.category} />
                </div>
                <StatusBadge status={listing.status} />
                <p className="text-sm">{listing.description}</p>
                <ListingMeta
                  listing={listing}
                  dateVariant="relative"
                  className="text-xs"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

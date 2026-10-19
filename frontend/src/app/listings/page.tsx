import { getListings } from "@/lib/listings.service";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/search/SearchBar";
import { SortingMenu } from "@/components/SortingMenu";
import type { SortOption } from "@/lib/types/listing.types";
import CategoryBadge from "@/components/listing/CategoryBadge";
import StatusBadge from "@/components/listing/StatusBadge";
import ListingMeta from "@/components/listing/ListingMeta";

export default async function ListingsPage({ searchParams }: PageProps<"/listings">) {
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
				</>
			)}
		</>
	);
}

import SearchBar from "@/components/search/SearchBar";
import { SortingMenu } from "@/components/SortingMenu";
import { getSearchResults } from "@/lib/searchResults.service";
import type { SortOption } from "@/lib/types/listing.types";
import Image from "next/image";
import Link from "next/link";

type PageProps = {
	searchParams: Promise<{ term?: string; location?: string; sort?: string }>;
};

export default async function SearchResults({ searchParams }: PageProps) {
	const { term, location, sort: sortParam } = await searchParams;
	const sort: SortOption = sortParam === "endingSoon" ? "endingSoon" : "newest";
	const searchResults = await getSearchResults({ term, location, sort });

	const listings = searchResults?.data ?? [];
	const total = searchResults?.meta.total ?? 0;

	return (
		<>
			<SearchBar defaultTerm={term} defaultLocation={location} />
			{total === 0 ? (
				<p>Es wurden leider keine Ergebnisse für deine Suche gefunden.</p>
			) : (
				<>
					{total > 1 && (
						<div className="flex w-full justify-end mb-2">
							<SortingMenu sort={sort} />
						</div>
					)}
					<p className="mb-3">
						{total} {total === 1 ? "Ergebnis" : "Ergebnisse"}
						{term && ` für "${term}"`}
						{location && ` in "${location}"`}
					</p>
					<ul className="grid grid-cols-2 gap-12">
						{listings.map((listing) => (
							<li
								key={listing.id}
								className="border-2 border-gray-300 rounded-lg px-3 py-2 basis-1/2 bg-gray-200"
							>
								<Link
									href={{
										pathname: `/listings/${listing.id}`,
										query: {
											term: term || undefined,
											location: location || undefined,
										},
									}}
									className="no-underline"
								>
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
			)}
		</>
	);
}

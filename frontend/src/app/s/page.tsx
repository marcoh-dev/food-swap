import { getSearchResults } from "@/lib/searchResults.service";

type PageProps = {
  searchParams: Promise<{ term?: string; location?: string; radius?: string }>;
};

export default async function Results({ searchParams }: PageProps) {
  const { term, location, radius } = await searchParams;
  const listings = await getSearchResults({ term, location, radius });
  return (
    <>
      <h2>Suchergebnisse</h2>
      <article>
        {listings.map((listing) => (
          <>
            <h3>{listing.title}</h3>
            <div>{listing.description}</div>
          </>
        ))}
      </article>
    </>
  );
}

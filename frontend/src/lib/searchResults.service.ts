import { fetchAPI } from "./fetchAPI";
import { ListingResponse } from "./types/listing.types";

type SearchParams = {
  term?: string;
  location?: string;
};

export async function getSearchResults({
  term,
  location,
}: {
  term?: string;
  location?: string;
}): Promise<ListingResponse[]> {
  const searchParams = new URLSearchParams();

  if (term) searchParams.set("term", term);
  if (location) searchParams.set("location", location);

  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL +
      `/listings?${searchParams.toString()}`,
    { cache: "no-store" },
  );
  console.log("status:", response.status);

  if (!response.ok) return [];

  const result = await response.json();
  console.log("result:", JSON.stringify(result).slice(0, 300));
  return result.data ?? [];
}

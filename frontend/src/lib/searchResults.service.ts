import { fetchAPI } from "./fetchAPI";
import { PaginatedListingsResponse } from "./types/listing.types";

export async function getSearchResults({
  term,
  location,
}: {
  term?: string;
  location?: string;
}): Promise<PaginatedListingsResponse | null> {
  const searchParams = new URLSearchParams();

  if (term) searchParams.set("term", term);
  if (location) searchParams.set("location", location);

  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL +
      `/listings?${searchParams.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) return null;

  return response.json();
}

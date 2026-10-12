import { fetchAPI } from "./fetchAPI";

type Listing = {
  title: string;
  description: string;
};

type SearchParams = {
  term?: string;
  location?: string;
  radius?: string;
};

export async function getSearchResults({
  term,
  location,
  radius,
}: SearchParams): Promise<Listing[]> {
  const searchParams = new URLSearchParams();

  if (term) searchParams.set("term", term);
  if (location) searchParams.set("location", location);
  if (radius) searchParams.set("radius", radius);

  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL +
      `/listings?${searchParams.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) return [];

  return response.json();
}

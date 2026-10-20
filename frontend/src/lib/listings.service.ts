import type {
  GetListingsOptions,
  ListingResponse,
  ListingStatus,
  NewListing,
  PaginatedListingsResponse,
  SortOption,
} from "./types/listing.types";
import { fetchAPI } from "./fetchAPI";

export async function getListings({
  page = 1,
  sort = "newest",
  term,
  location,
  category,
  tags,
}: GetListingsOptions): Promise<PaginatedListingsResponse | null> {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("sort", sort);

  if (term) query.set("term", term);
  if (location) query.set("location", location);
  if (category) query.set("category", category);
  if (tags) query.set("tags", tags);

  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/listings?${query.toString()}`,
  );
  if (!response.ok) {
    return null;
  }
  const listingsData = await response.json();
  return listingsData;
}

export async function getUserListings({
  userId,
  page = 1,
  sort = "newest",
}: {
  userId: string;
  page?: number;
  sort?: SortOption;
}): Promise<PaginatedListingsResponse | undefined> {
  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL +
      `/users/${userId}/listings?page=${page}&sort=${sort}`,
  );
  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch user listings: ${response.status}`);
  }
  const listingsData = await response.json();

  return listingsData;
}

export async function createListing(
  data: NewListing,
): Promise<ListingResponse> {
  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL + "/listings",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  const listingData = await response.json();
  return listingData;
}

export async function getListingById(
  id: string,
): Promise<ListingResponse | undefined> {
  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/listings/${id}`,
  );

  // 404: no such listing, 400: malformed ID; both show the not-found page
  if (response.status === 404 || response.status === 400) return undefined;
  if (!response.ok) throw new Error("Das Angebot konnte nicht geladen werden.");

  return response.json();
}

export async function updateListing(
  id: string,
  data: NewListing,
): Promise<ListingResponse | undefined> {
  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/listings/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  const listingData = await response.json();
  return listingData;
}

export async function deleteListing(id: string): Promise<void> {
  await fetchAPI(process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/listings/${id}`, {
    method: "DELETE",
  });
}

export async function updateListingStatus(
  id: string,
  status: ListingStatus,
): Promise<{ listing?: ListingResponse; error?: string }> {
  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/listings/${id}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  const data = await response.json();

  if (!response.ok) {
    return { error: String(data.message) };
  }

  return { listing: data };
}

import {
  ListingResponse,
  NewListing,
  PaginatedListingsResponse,
} from "./types/listing.types";
import { fetchAPI } from "./fetchAPI";
import { PaginationMetaResponse } from "./types/common.types";

export async function getListings({
  page,
}: Partial<PaginationMetaResponse>): Promise<PaginatedListingsResponse | null> {
  const response = await fetchAPI(
    process.env.NEXT_PUBLIC_FOODSWAP_API_URL + `/listings?page=${page}`,
  );
  if (!response.ok) return null;
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
  const listingsData = await response.json();

  return listingsData;
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

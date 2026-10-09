import {
  ListingResponse,
  NewListing,
  PaginatedListingsResponse,
} from "./types/listing.types";
import { fetchAPI } from "./fetchAPI";
import { PaginationMetaResponse } from "./types/common.types";

const API_URL = process.env.NEXT_PUBLIC_FOODSWAP_API_URL;

export async function getListings({
  page,
}: Partial<PaginationMetaResponse>): Promise<PaginatedListingsResponse> {
  if (!API_URL) {
    throw new Error("API_URL is not set.");
  }
  const response = await fetchAPI(API_URL + `/listings?page=${page}`);
  const listingsData = await response.json();
  return listingsData;
}

export async function createListing(
  data: NewListing,
): Promise<ListingResponse> {
  if (!API_URL) {
    throw new Error("API_URL is not set.");
  }
  const response = await fetchAPI(API_URL + "/listings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const listingData = await response.json();

  return listingData;
}

export async function getListingById(
  id: string,
): Promise<ListingResponse | undefined> {
  if (!API_URL) {
    throw new Error("API_URL is not set.");
  }
  const response = await fetchAPI(API_URL + `/listings/${id}`);
  const listingsData = await response.json();

  return listingsData;
}

export async function updateListing(
  id: string,
  data: NewListing,
): Promise<ListingResponse | undefined> {
  const listing = listings.find((l) => l.id === id);
  if (listing) Object.assign(listing, data);
  return listing;
}

export async function deleteListing(id: string): Promise<void> {
  const index = listings.findIndex((l) => l.id === id);
  if (index !== -1) listings.splice(index, 1);
}

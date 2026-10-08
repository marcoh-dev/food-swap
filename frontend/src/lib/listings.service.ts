import { randomUUID } from "crypto";

type ListingResponse = {
  id: string;
  name: string;
  description: string;
  location: string;
  type: string;
};

type NewListing = {
  name: string;
  description: string;
  location: string;
  type: string;
};

const listings: ListingResponse[] = [];

export async function createListing(
  data: NewListing,
): Promise<ListingResponse> {
  const listing = { id: randomUUID(), ...data };
  listings.push(listing);
  return listing;
}

export async function getListings(): Promise<ListingResponse[]> {
  return listings;
}

export async function getListingById(
  id: string,
): Promise<ListingResponse | undefined> {
  const listing = listings.find((listing) => listing.id === id);
  return listing;
}

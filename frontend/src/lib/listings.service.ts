import { randomUUID } from "crypto";
import { ListingResponse, NewListing } from "./types/listing.types";

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

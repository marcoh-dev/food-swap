import { mockListings as data } from "@/lib/data/listings.mockdata";
import type { ListingResponse } from "@/lib/types/listing.types";

export async function getListings(): Promise<ListingResponse[]> {
return data
}
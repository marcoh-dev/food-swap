import { PaginationMetaResponse } from "./common.types";

export type ListingResponse = {
  id: string;
  name: string;
  description: string;
  location: string;
  type: string;
};

export type NewListing = {
  name: string;
  description: string;
  location: string;
  type: string;
};

export type PaginatedListingsResponse = {
  data: ListingResponse[];
  meta: PaginationMetaResponse;
};

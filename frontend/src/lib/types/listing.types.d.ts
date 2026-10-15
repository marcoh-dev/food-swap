import { Category } from "./category.types";
import { PaginationMetaResponse } from "./common.types";
import { User } from "./user.types";

export type ListingResponse = {
  id: string;
  title: string;
  description: string;
  image?: string;
  location: string;
  type: ListingType;
  owner: User;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
};

export type NewListing = {
  title: string;
  description: string;
  image?: string;
  location: string;
  type: ListingType;
  categoryId?: string | null;
};

export type PaginatedListingsResponse = {
  data: ListingResponse[];
  meta: PaginationMetaResponse;
};

export type ListingType = "swap" | "giveaway";

export type SortOption = "newest" | "oldest";

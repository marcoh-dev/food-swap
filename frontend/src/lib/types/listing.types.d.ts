import { Category } from "./category.types";
import { PaginationMetaResponse } from "./common.types";
import { Tag } from "./tag.types";
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
  tags: Tag[];
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
  tagIds?: string[];
};

export type PaginatedListingsResponse = {
  data: ListingResponse[];
  meta: PaginationMetaResponse;
};

export type ListingType = "swap" | "giveaway";

export type SortOption = "newest" | "oldest";

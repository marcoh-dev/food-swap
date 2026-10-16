import type { Category } from "./category.types";
import type { PaginationMetaResponse } from "./common.types";
import type { Tag } from "./tag.types";
import type { User } from "./user.types";

export type ListingResponse = {
  id: string;
  title: string;
  description: string;
  image?: string;
  location: string;
  type: ListingType;
  status: ListingStatus;
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

export type ListingStatus = "pending" | "active" | "reserved" | "deactivated";

export type StatusAction = {
  label: string;
  targetStatus: ListingStatus;
};

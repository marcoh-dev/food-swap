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

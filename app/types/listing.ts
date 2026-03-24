export interface Listing {
  id: string;
  slug: string;
  title: string;
  price: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrls: string[];
  description?: string;
  neighborhood?: string;
  highlights?: string[];
  amenities?: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  rating?: number;
  listingType: "sale" | "rent";
  status?: "available" | "pending" | "sold";
}

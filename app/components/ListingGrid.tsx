"use client";

// pages/listings.tsx or components/ListingGrid.tsx
import React from "react";
import ListingCard from "./ListingCard";

import ListingCardHorizontal from "./ListingCardHorizontal";
import ListingCardCompact from "./ListingCardCompact";
import ListingCardSkeleton from "./ListingCardSkeleton";

const sampleListings = [
  {
    id: "1",
    title: "Modern Waterfront Villa",
    price: 899000,
    address: "123 Ocean Drive, Miami Beach, FL 33139",
    beds: 4,
    baths: 3,
    sqft: 2800,
    imageUrls: ["/heroimage.jpg", "/heroimage.jpg", "/heroimage.jpg"],
    isFeatured: true,
    isNew: true,
    rating: 4.8,
    listingType: "sale" as const,
  },
  // ... more listings
];

function ListingGrid() {
  const [isLoading] = React.useState(false);

  return (
    <div className="container-custom section-padding">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? // Show skeletons while loading
            Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))
          : // Show actual listings
            sampleListings.map((listing) => (
              <ListingCard
                key={listing.id}
                {...listing}
                onClick={() => console.log("Clicked", listing.id)}
                onSave={() => console.log("Saved", listing.id)}
                onShare={() => console.log("Shared", listing.id)}
              />
            ))}
      </div>

      {/* Horizontal List Layout */}
      <div className="mt-12 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Featured Properties</h2>
        {sampleListings.slice(0, 3).map((listing) => (
          <ListingCardHorizontal
            key={listing.id}
            {...listing}
            imageUrl={listing.imageUrls[0]}
            propertyType="Single Family"
            yearBuilt={2020}
          />
        ))}
      </div>

      {/* Compact Sidebar List */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Similar Properties</h2>
        <div className="space-y-3">
          {sampleListings.slice(0, 4).map((listing) => (
            <ListingCardCompact
              key={listing.id}
              {...listing}
              imageUrl={listing.imageUrls[0]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ListingGrid;

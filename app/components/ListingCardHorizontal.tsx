// components/ListingCardHorizontal.tsx
import Image from "next/image";
import React from "react";
import { Bed, Bath, Square, MapPin, Heart, Calendar, Home } from "lucide-react";

interface ListingCardHorizontalProps {
  id: string;
  title: string;
  price: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl: string;
  listingType: "sale" | "rent";
  yearBuilt?: number;
  propertyType?: string;
}

function ListingCardHorizontal({
  title,
  price,
  address,
  beds,
  baths,
  sqft,
  imageUrl,
  listingType,
  yearBuilt,
  propertyType,
}: ListingCardHorizontalProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-neutral-900 rounded-xl shadow-card hover:shadow-hover transition-all duration-300">
      {/* Image */}
      <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0">
        <Image
          src={imageUrl || "/heroimage.jpg"}
          alt={title}
          fill
          className="object-cover rounded-xl"
          sizes="(max-width: 768px) 100vw, 256px"
        />
        <span className="absolute top-3 left-3 px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full">
          {listingType === "rent" ? "For Rent" : "For Sale"}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {address}
            </p>
          </div>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {listingType === "rent"
              ? `$${price}/mo`
              : `$${price.toLocaleString()}`}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {beds} Beds
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {baths} Baths
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Square className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {sqft.toLocaleString()} sqft
            </span>
          </div>
          {propertyType && (
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-neutral-500" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {propertyType}
              </span>
            </div>
          )}
        </div>

        {/* Additional Info & Actions */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            {yearBuilt && (
              <div className="flex items-center gap-1 text-sm text-neutral-500">
                <Calendar className="w-4 h-4" />
                Built in {yearBuilt}
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-neutral-500">
              <Home className="w-4 h-4" />
              MLS: 1234567
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingCardHorizontal;

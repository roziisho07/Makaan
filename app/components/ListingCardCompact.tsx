// components/ListingCardCompact.tsx
import Image from "next/image";
import React from "react";
import { Bed, Bath, Square, MapPin, Heart } from "lucide-react";

interface ListingCardCompactProps {
  id: string;
  title: string;
  price: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl: string;
  listingType: "sale" | "rent";
}

function ListingCardCompact({
  title,
  price,
  address,
  beds,
  baths,
  sqft,
  imageUrl,
  listingType,
}: ListingCardCompactProps) {
  return (
    <div className="flex gap-3 p-2 bg-white dark:bg-neutral-900 rounded-lg hover:shadow-medium transition-shadow duration-200">
      {/* Image */}
      <div className="relative w-20 h-20 shrink-0">
        <Image
          src={imageUrl || "/heroimage.jpg"}
          alt={title}
          fill
          className="object-cover rounded-lg"
          sizes="80px"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-900 dark:text-white text-sm line-clamp-1">
          {title}
        </h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 shrink-0" />
          {address}
        </p>

        {/* Features */}
        <div className="flex items-center gap-3 mt-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <Bed className="w-3 h-3" /> {beds}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3 h-3" /> {baths}
          </span>
          <span className="flex items-center gap-1">
            <Square className="w-3 h-3" /> {sqft}
          </span>
        </div>
      </div>

      {/* Price & Action */}
      <div className="text-right shrink-0">
        <p className="font-bold text-primary-600 dark:text-primary-400 text-sm">
          {listingType === "rent"
            ? `$${price}/mo`
            : `$${price.toLocaleString()}`}
        </p>
        <button className="mt-2 text-error-500 hover:text-error-600">
          <Heart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default ListingCardCompact;

// components/ListingCardSkeleton.tsx
import React from "react";

function ListingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-card overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 sm:h-56 md:h-64 bg-neutral-200 dark:bg-neutral-800"></div>

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Price and Rating */}
        <div className="flex justify-between items-start mb-2">
          <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        </div>

        {/* Title */}
        <div className="h-6 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-2"></div>

        {/* Address */}
        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded mb-3"></div>

        {/* Features */}
        <div className="flex items-center gap-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        </div>

        {/* Agent Info */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
            <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          </div>
          <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default ListingCardSkeleton;

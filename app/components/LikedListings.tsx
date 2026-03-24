"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ListingCard from "./ListingCard";
import type { Listing } from "../types/listing";
import { getAnonymousClientId } from "../lib/anonymousClient";
import { getListingPath } from "../data/listings";

interface LikedListingsProps {
  showTitle?: boolean;
  compact?: boolean;
}

export default function LikedListings({
  showTitle = true,
  compact = false,
}: LikedListingsProps) {
  const [likedListings, setLikedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLikedListings = async () => {
    try {
      const clientId = getAnonymousClientId();
      const response = await fetch(`/api/saved-listings?clientId=${clientId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load liked listings");
      }

      const payload = (await response.json()) as { data?: Listing[] };
      setLikedListings(Array.isArray(payload.data) ? payload.data : []);
    } catch {
      setLikedListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLikedListings();
  }, []);

  const handleUnsave = async (listingId: string, saved: boolean) => {
    if (saved) {
      return;
    }

    try {
      await fetch("/api/saved-listings", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          clientId: getAnonymousClientId(),
        }),
      });

      setLikedListings((prev) => prev.filter((item) => item.id !== listingId));
    } catch {
      // Keep UI stable on network errors
    }
  };

  if (isLoading) {
    return (
      <div className="card-soft rounded-2xl p-6 text-muted">
        Loading likes...
      </div>
    );
  }

  if (likedListings.length === 0) {
    return (
      <div className="card-soft rounded-2xl p-6 text-center">
        {showTitle && (
          <h2 className="text-xl font-semibold mb-2">Your Liked Listings</h2>
        )}
        <p className="text-muted mb-4">
          You have not liked any properties yet. Tap the heart icon on a listing
          to save it.
        </p>
        <Link
          href="/listings"
          className="inline-flex items-center px-5 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors font-semibold"
        >
          Browse Listings
        </Link>
      </div>
    );
  }

  const visible = compact ? likedListings.slice(0, 3) : likedListings;

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-2xl font-semibold">Your Liked Listings</h2>
          {compact && likedListings.length > 3 && (
            <Link
              href="/likes"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((listing) => (
          <ListingCard
            key={listing.id}
            {...listing}
            href={getListingPath(listing)}
            saved
            onSave={(saved) => void handleUnsave(listing.id, saved)}
          />
        ))}
      </div>
    </div>
  );
}

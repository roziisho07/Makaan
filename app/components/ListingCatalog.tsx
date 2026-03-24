"use client";

import { useEffect, useMemo, useState } from "react";
import ListingCard from "./ListingCard";
import type { Listing } from "../types/listing";
import { getListingPath } from "../data/listings";
import { logSearchEvent } from "../lib/analyticsClient";

interface ListingCatalogProps {
  listings: Listing[];
  showTypeFilter?: boolean;
  emptyLabel?: string;
}

type SortMode = "recommended" | "priceAsc" | "priceDesc" | "bedsDesc";

function listingMatchesQuery(listing: Listing, query: string): boolean {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = query.toLowerCase();
  return (
    listing.title.toLowerCase().includes(normalizedQuery) ||
    listing.address.toLowerCase().includes(normalizedQuery) ||
    `${listing.beds} bed`.includes(normalizedQuery)
  );
}

function ListingCatalog({
  listings,
  showTypeFilter = true,
  emptyLabel = "No listings match your current filters.",
}: ListingCatalogProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<
    "all" | "available" | "pending" | "sold"
  >("all");
  const [type, setType] = useState<"all" | "sale" | "rent">("all");
  const [sort, setSort] = useState<SortMode>("recommended");

  const filtered = useMemo(() => {
    const next = listings
      .filter((listing) => listingMatchesQuery(listing, query))
      .filter((listing) =>
        status === "all" ? true : (listing.status ?? "available") === status,
      )
      .filter((listing) =>
        showTypeFilter && type !== "all" ? listing.listingType === type : true,
      );

    const sorted = [...next];
    if (sort === "priceAsc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === "priceDesc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sort === "bedsDesc") {
      sorted.sort((a, b) => b.beds - a.beds);
    }

    return sorted;
  }, [listings, query, showTypeFilter, sort, status, type]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalizedQuery = query.trim() || "catalog_browse";
      const resultIds = filtered.slice(0, 20).map((listing) => listing.id);

      void logSearchEvent({
        query: normalizedQuery,
        filters: {
          status,
          type: showTypeFilter ? type : "page_context",
          sort,
        },
        resultIds,
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filtered, query, showTypeFilter, sort, status, type]);

  return (
    <div className="space-y-6">
      <div className="card-soft rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title or location"
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/30"
        />

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value as "all" | "available" | "pending" | "sold",
            )
          }
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option value="all">All status</option>
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </select>

        {showTypeFilter ? (
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as "all" | "sale" | "rent")
            }
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="all">All types</option>
            <option value="sale">For sale</option>
            <option value="rent">For rent</option>
          </select>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-4 py-3 text-sm text-muted flex items-center">
            Filtered by page context
          </div>
        )}

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortMode)}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option value="recommended">Recommended</option>
          <option value="priceAsc">Price: low to high</option>
          <option value="priceDesc">Price: high to low</option>
          <option value="bedsDesc">Most bedrooms</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card-soft rounded-2xl p-8 text-center text-muted">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              {...listing}
              href={getListingPath(listing)}
              onClick={() => {
                const resultIds = filtered.slice(0, 20).map((item) => item.id);

                void logSearchEvent({
                  query: query.trim() || "catalog_browse",
                  filters: {
                    status,
                    type: showTypeFilter ? type : "page_context",
                    sort,
                  },
                  resultIds,
                  clickedListingId: listing.id,
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ListingCatalog;

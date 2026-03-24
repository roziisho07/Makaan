// app/page.tsx

"use client";

import ListingCard from "./ListingCard";
import RecommendedForYou from "./RecommendedForYou";
import LikedListings from "./LikedListings";
import AIPropertyAssistant from "./AIPropertyAssistant";
import { useEffect, useMemo, useState } from "react";
import {
  Home as HomeIcon,
  Building2,
  Users,
  Star,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useListingSignals } from "../hooks/useListingSignals";
import { getRecommendedListings } from "../lib/recommendationEngine";
import { getListingPath } from "../data/listings";
import type { Listing } from "../types/listing";
import { logSearchEvent } from "../lib/analyticsClient";
import { getAnonymousClientId } from "../lib/anonymousClient";

interface MainListingProps {
  listings: Listing[];
}

// Stats data
const stats = [
  { label: "Properties Sold", value: "10,000+", icon: HomeIcon },
  { label: "Happy Customers", value: "8,500+", icon: Users },
  { label: "Cities Covered", value: "50+", icon: Building2 },
  { label: "Years Experience", value: "15+", icon: Star },
];

export default function MainListing({ listings }: MainListingProps) {
  const [query, setQuery] = useState("");
  const [listingType, setListingType] = useState<"all" | "sale" | "rent">(
    "all",
  );
  const [dbRecommendedListings, setDbRecommendedListings] = useState<Listing[]>(
    [],
  );

  const {
    viewedIds,
    savedIds,
    trackView,
    setSaved,
    syncSavedToServer,
    isSaved,
    hasRecommendationSignals,
  } = useListingSignals();

  const recommendedListings = useMemo(
    () => getRecommendedListings(listings, viewedIds, savedIds, 3),
    [listings, savedIds, viewedIds],
  );

  const finalRecommendedListings =
    dbRecommendedListings.length > 0
      ? dbRecommendedListings
      : recommendedListings;

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return listings.filter((listing) => {
      const matchesType =
        listingType === "all" ? true : listing.listingType === listingType;
      const matchesQuery = !normalizedQuery
        ? true
        : listing.title.toLowerCase().includes(normalizedQuery) ||
          listing.address.toLowerCase().includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [listingType, query, listings]);

  const featuredSlice = filteredListings.slice(0, 3);
  const recentSlice = filteredListings.slice(3, 6);

  const handleView = (listingId: string) => {
    trackView(listingId);

    void logSearchEvent({
      query: query.trim() || "home_browse",
      filters: {
        listingType,
      },
      resultIds: filteredListings.slice(0, 20).map((listing) => listing.id),
      clickedListingId: listingId,
    });
  };

  const handleSave = (listingId: string, saved: boolean) => {
    setSaved(listingId, saved);
    void syncSavedToServer(listingId, saved);
  };

  useEffect(() => {
    if (!hasRecommendationSignals) {
      return;
    }

    const controller = new AbortController();

    async function loadDbRecommendations() {
      try {
        const clientId = getAnonymousClientId();
        const excludeIds = Array.from(new Set([...viewedIds, ...savedIds]));

        const params = new URLSearchParams({
          clientId,
          limit: "3",
        });

        if (excludeIds.length > 0) {
          params.set("excludeIds", excludeIds.join(","));
        }

        const response = await fetch(
          `/api/recommendations?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { data?: Listing[] };
        if (Array.isArray(payload.data)) {
          setDbRecommendedListings(payload.data);
        }
      } catch {
        // Ignore network issues and keep local recommendations.
      }
    }

    void loadDbRecommendations();

    return () => {
      controller.abort();
    };
  }, [hasRecommendationSignals, savedIds, viewedIds]);

  return (
    <div className="w-full">
      <section className="section-padding bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container-custom">
          <div className="card-soft rounded-2xl p-4 sm:p-5 mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by city or property title"
              className="md:col-span-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/30"
            />
            <select
              value={listingType}
              onChange={(event) =>
                setListingType(event.target.value as "all" | "sale" | "rent")
              }
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="all">All types</option>
              <option value="sale">For sale</option>
              <option value="rent">For rent</option>
            </select>
          </div>

          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="heading-2 mb-4">Featured Properties</h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Hand-picked properties by our team
              </p>
            </div>
            <Link
              href="/listings"
              className="hidden sm:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium group"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSlice.map((listing) => (
              <ListingCard
                key={listing.id}
                {...listing}
                href={getListingPath(listing)}
                saved={isSaved(listing.id)}
                onClick={() => handleView(listing.id)}
                onSave={(saved) => handleSave(listing.id, saved)}
              />
            ))}
          </div>

          {/* Mobile View All Button */}
          <div className="sm:hidden mt-8 text-center">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              View All Properties
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <AIPropertyAssistant listings={listings} />

      {hasRecommendationSignals && (
        <RecommendedForYou
          listings={finalRecommendedListings}
          isSaved={isSaved}
          onView={handleView}
          onSave={handleSave}
        />
      )}

      <section className="section-padding pt-0">
        <div className="container-custom">
          <LikedListings compact />
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="text-center p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-card"
                >
                  <div className="w-14 h-14 mx-auto mb-4 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Listings Section */}
      <section className="section-padding bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Recent Listings</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Check out our newest properties on the market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSlice.map((listing) => (
              <ListingCard
                key={listing.id}
                {...listing}
                href={getListingPath(listing)}
                saved={isSaved(listing.id)}
                onClick={() => handleView(listing.id)}
                onSave={(saved) => handleSave(listing.id, saved)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="relative bg-linear-to-r from-primary-600 to-primary-800 rounded-3xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url('/patterns/grid.svg')",
                  backgroundSize: "30px 30px",
                }}
              ></div>
            </div>

            <div className="relative px-6 py-16 md:py-20 md:px-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Find Your Dream Home?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of happy homeowners who found their perfect
                property with us
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/listings"
                  className="px-8 py-4 bg-white text-primary-600 hover:bg-neutral-100 font-semibold rounded-xl transition-colors"
                >
                  Browse Properties
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold rounded-xl transition-colors"
                >
                  Contact an Agent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

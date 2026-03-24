"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Listing } from "../types/listing";
import { getListingPath } from "../data/listings";

interface AIPropertyAssistantProps {
  listings: Listing[];
}

interface AssistantResult {
  answer: string;
  filtersApplied: string[];
  suggestedIds: string[];
}

export default function AIPropertyAssistant({
  listings,
}: AIPropertyAssistantProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AssistantResult | null>(null);

  const listingById = useMemo(
    () => new Map(listings.map((listing) => [listing.id, listing])),
    [listings],
  );

  const suggestedListings = (result?.suggestedIds ?? [])
    .map((id) => listingById.get(id))
    .filter((listing): listing is Listing => Boolean(listing));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        message: query.trim(),
        listings: listings.slice(0, 40).map((listing) => ({
          id: listing.id,
          title: listing.title,
          price: listing.price,
          address: listing.address,
          beds: listing.beds,
          baths: listing.baths,
          sqft: listing.sqft,
          listingType: listing.listingType,
          description: listing.description,
        })),
      };

      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not run AI assistant");
      }

      const parsed = (await response.json()) as {
        data?: AssistantResult;
      };

      setResult(parsed.data ?? null);
    } catch {
      setResult({
        answer:
          "Assistant is unavailable right now. Please try a simpler query or browse listings manually.",
        filtersApplied: [],
        suggestedIds: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="section-padding pt-0">
      <div className="container-custom">
        <div className="card-soft rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">AI Property Assistant</h2>
              <p className="text-sm text-muted">
                Try: &quot;2 bed rent under 3000 in miami&quot; or &quot;family home for
                sale under 800k&quot;
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Describe what you want in plain language"
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500/30"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors font-semibold disabled:opacity-70"
            >
              {isLoading ? "Thinking..." : "Ask AI"}
            </button>
          </form>

          {result && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <p className="text-sm sm:text-base">{result.answer}</p>

              {result.filtersApplied.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.filtersApplied.map((item) => (
                    <span
                      key={item}
                      className="text-xs px-2 py-1 rounded-full bg-primary-500/10 text-primary-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {suggestedListings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Suggested listings</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {suggestedListings.map((listing) => (
                      <Link
                        key={listing.id}
                        href={getListingPath(listing)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <p className="text-sm font-medium line-clamp-1">
                          {listing.title}
                        </p>
                        <p className="text-xs text-muted line-clamp-1">
                          ${listing.price.toLocaleString()} • {listing.address}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

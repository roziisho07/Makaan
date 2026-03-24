import type { Listing } from "../types/listing";

interface ScoredListing {
  listing: Listing;
  score: number;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function normalizedDifference(a: number, b: number): number {
  const divisor = Math.max(Math.abs(a), Math.abs(b), 1);
  return clamp(1 - Math.abs(a - b) / divisor);
}

function getAddressRegion(address: string): string {
  const parts = address.split(",").map((part) => part.trim().toLowerCase());
  return [parts.at(-2), parts.at(-1)].filter(Boolean).join("|");
}

function getSimilarityScore(seed: Listing, candidate: Listing): number {
  let score = 0;

  if (seed.listingType === candidate.listingType) {
    score += 0.35;
  }

  score += normalizedDifference(seed.price, candidate.price) * 0.2;
  score += normalizedDifference(seed.beds, candidate.beds) * 0.15;
  score += normalizedDifference(seed.baths, candidate.baths) * 0.1;
  score += normalizedDifference(seed.sqft, candidate.sqft) * 0.1;

  if (getAddressRegion(seed.address) === getAddressRegion(candidate.address)) {
    score += 0.1;
  }

  if (candidate.status === "available") {
    score += 0.05;
  }

  if (typeof candidate.rating === "number") {
    score += (candidate.rating / 5) * 0.05;
  }

  return clamp(score, 0, 1);
}

export function getRecommendedListings(
  listings: Listing[],
  viewedIds: string[],
  savedIds: string[],
  limit = 3,
): Listing[] {
  const listingById = new Map(listings.map((listing) => [listing.id, listing]));

  // Saved listings are stronger preference signals than simple views.
  const seedIds = [
    ...savedIds.slice().reverse(),
    ...viewedIds.slice().reverse(),
  ];
  const uniqueSeedIds = Array.from(new Set(seedIds)).slice(0, 3);

  if (uniqueSeedIds.length === 0) {
    return [];
  }

  const excludedIds = new Set([...viewedIds, ...savedIds]);

  const candidates: ScoredListing[] = listings
    .filter((listing) => !excludedIds.has(listing.id))
    .map((candidate) => {
      const seedScores = uniqueSeedIds
        .map((seedId, index) => {
          const seed = listingById.get(seedId);
          if (!seed) {
            return 0;
          }

          const recencyWeight = 1 - index * 0.2;
          return getSimilarityScore(seed, candidate) * recencyWeight;
        })
        .filter((score) => score > 0);

      const averageScore =
        seedScores.length > 0
          ? seedScores.reduce((acc, score) => acc + score, 0) /
            seedScores.length
          : 0;

      return {
        listing: candidate,
        score: averageScore,
      };
    })
    .sort((a, b) => b.score - a.score);

  return candidates.slice(0, limit).map((item) => item.listing);
}

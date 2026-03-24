import type { Prisma } from "@prisma/client";
import type { Listing } from "../types/listing";
import { getListingBySlugOrId, sampleListings } from "../data/listings";
import { prisma } from "./prisma";

type ListingFilters = {
  query?: string;
  listingType?: "sale" | "rent" | "all";
  status?: "available" | "pending" | "sold" | "all";
  limit?: number;
};

type DbListing = Prisma.ListingGetPayload<Record<string, never>>;

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

function getRecommendationsFromSeeds(
  listings: Listing[],
  seedIds: string[],
  excludedIds: string[],
  limit: number,
): Listing[] {
  const listingById = new Map(listings.map((listing) => [listing.id, listing]));
  const uniqueSeedIds = Array.from(new Set(seedIds)).slice(0, 6);

  if (uniqueSeedIds.length === 0) {
    return [];
  }

  const excludedSet = new Set(excludedIds);

  const candidates: ScoredListing[] = listings
    .filter((listing) => !excludedSet.has(listing.id))
    .map((candidate) => {
      const weightedScores = uniqueSeedIds
        .map((seedId, index) => {
          const seed = listingById.get(seedId);
          if (!seed) {
            return 0;
          }

          const recencyWeight = 1 - index * 0.12;
          return getSimilarityScore(seed, candidate) * recencyWeight;
        })
        .filter((score) => score > 0);

      const averageScore =
        weightedScores.length > 0
          ? weightedScores.reduce((acc, score) => acc + score, 0) /
            weightedScores.length
          : 0;

      return {
        listing: candidate,
        score: averageScore,
      };
    })
    .sort((a, b) => b.score - a.score);

  return candidates.slice(0, limit).map((item) => item.listing);
}

function mapDbListingToListing(dbListing: DbListing): Listing {
  return {
    id: dbListing.id,
    slug: dbListing.slug,
    title: dbListing.title,
    price: dbListing.price,
    address: dbListing.address,
    beds: dbListing.beds,
    baths: dbListing.baths,
    sqft: dbListing.sqft,
    imageUrls: dbListing.imageUrls,
    description: dbListing.description ?? undefined,
    neighborhood: dbListing.neighborhood ?? undefined,
    highlights: dbListing.highlights,
    amenities: dbListing.amenities,
    isFeatured: dbListing.isFeatured,
    isNew: dbListing.isNew,
    rating: dbListing.rating ?? undefined,
    listingType: dbListing.listingType,
    status: dbListing.status,
  };
}

function filterInMemory(listings: Listing[], filters: ListingFilters) {
  const normalizedQuery = filters.query?.trim().toLowerCase();

  let filtered = listings.filter((listing) => {
    const matchesType =
      !filters.listingType || filters.listingType === "all"
        ? true
        : listing.listingType === filters.listingType;

    const matchesStatus =
      !filters.status || filters.status === "all"
        ? true
        : listing.status === filters.status;

    const matchesQuery = !normalizedQuery
      ? true
      : listing.title.toLowerCase().includes(normalizedQuery) ||
        listing.address.toLowerCase().includes(normalizedQuery) ||
        (listing.neighborhood ?? "").toLowerCase().includes(normalizedQuery);

    return matchesType && matchesStatus && matchesQuery;
  });

  if (filters.limit && filters.limit > 0) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

export async function getListings(
  filters: ListingFilters = {},
): Promise<Listing[]> {
  const noDatabase = !process.env.DATABASE_URL;

  if (noDatabase) {
    return filterInMemory(sampleListings, filters);
  }

  try {
    const listings = await prisma.listing.findMany({
      where: {
        listingType:
          filters.listingType && filters.listingType !== "all"
            ? filters.listingType
            : undefined,
        status:
          filters.status && filters.status !== "all"
            ? filters.status
            : undefined,
        OR: filters.query
          ? [
              { title: { contains: filters.query, mode: "insensitive" } },
              { address: { contains: filters.query, mode: "insensitive" } },
              {
                neighborhood: { contains: filters.query, mode: "insensitive" },
              },
            ]
          : undefined,
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: filters.limit,
    });

    return listings.map((item) => mapDbListingToListing(item));
  } catch {
    return filterInMemory(sampleListings, filters);
  }
}

export async function getListingBySlug(
  slug: string,
): Promise<Listing | undefined> {
  const noDatabase = !process.env.DATABASE_URL;

  if (noDatabase) {
    return getListingBySlugOrId(slug);
  }

  try {
    const listing = await prisma.listing.findUnique({ where: { slug } });

    if (!listing) {
      return getListingBySlugOrId(slug);
    }

    return mapDbListingToListing(listing);
  } catch {
    return getListingBySlugOrId(slug);
  }
}

function toAnonEmail(clientId: string) {
  return `anon+${clientId}@makaan.local`;
}

export async function getPersonalizedRecommendations(
  clientId: string,
  options: {
    limit?: number;
    excludeIds?: string[];
  } = {},
): Promise<Listing[]> {
  const limit = options.limit ?? 3;
  const excludeIds = options.excludeIds ?? [];

  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const user = await prisma.appUser.findUnique({
      where: {
        email: toAnonEmail(clientId),
      },
      include: {
        savedListings: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        searchEvents: {
          orderBy: { createdAt: "desc" },
          take: 40,
        },
      },
    });

    if (!user) {
      return [];
    }

    const weightedSignals = new Map<string, number>();

    for (const item of user.savedListings) {
      weightedSignals.set(
        item.listingId,
        (weightedSignals.get(item.listingId) ?? 0) + 6,
      );
    }

    for (const event of user.searchEvents) {
      if (event.clickedListingId) {
        weightedSignals.set(
          event.clickedListingId,
          (weightedSignals.get(event.clickedListingId) ?? 0) + 4,
        );
      }

      event.topResultIds.slice(0, 6).forEach((listingId, index) => {
        const positionalWeight = Math.max(0.2, 1 - index * 0.15);
        weightedSignals.set(
          listingId,
          (weightedSignals.get(listingId) ?? 0) + positionalWeight,
        );
      });
    }

    const seedIds = Array.from(weightedSignals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([listingId]) => listingId)
      .slice(0, 8);

    if (seedIds.length === 0) {
      return [];
    }

    const listings = await getListings();

    return getRecommendationsFromSeeds(listings, seedIds, excludeIds, limit);
  } catch {
    return [];
  }
}

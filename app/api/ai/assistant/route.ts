import { NextResponse } from "next/server";
import { z } from "zod";

const listingSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
  address: z.string(),
  beds: z.number(),
  baths: z.number(),
  sqft: z.number(),
  listingType: z.enum(["sale", "rent"]),
  description: z.string().optional(),
});

const assistantSchema = z.object({
  message: z.string().min(2).max(500),
  listings: z.array(listingSchema).max(50),
});

function parseBudget(input: string): number | null {
  const normalized = input.toLowerCase();
  const budgetMatch = normalized.match(
    /(under|below|max|budget|upto|up to)?\s*\$?\s*(\d+(?:[\d,.]*)?)\s*(k|m)?/,
  );

  if (!budgetMatch) {
    return null;
  }

  const valueRaw = budgetMatch[2]?.replaceAll(",", "") ?? "";
  const multiplier = budgetMatch[3];
  const value = Number.parseFloat(valueRaw);

  if (Number.isNaN(value)) {
    return null;
  }

  if (multiplier === "k") {
    return value * 1000;
  }

  if (multiplier === "m") {
    return value * 1_000_000;
  }

  return value;
}

function parseBeds(input: string): number | null {
  const match = input.toLowerCase().match(/(\d+)\s*(bed|beds|br|bedroom)/);
  if (!match?.[1]) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

function parseListingType(input: string): "sale" | "rent" | null {
  const normalized = input.toLowerCase();
  if (normalized.includes("rent") || normalized.includes("rental")) {
    return "rent";
  }

  if (
    normalized.includes("buy") ||
    normalized.includes("sale") ||
    normalized.includes("purchase")
  ) {
    return "sale";
  }

  return null;
}

function parseLocation(input: string, listings: z.infer<typeof listingSchema>[]) {
  const normalized = input.toLowerCase();
  const knownLocations = Array.from(
    new Set(
      listings
        .map((listing) => listing.address.split(",")[1]?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value)),
    ),
  );

  return (
    knownLocations.find((location) => normalized.includes(location)) ?? null
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = assistantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { message, listings } = parsed.data;
  const budget = parseBudget(message);
  const beds = parseBeds(message);
  const type = parseListingType(message);
  const location = parseLocation(message, listings);

  const filtered = listings
    .filter((listing) => (type ? listing.listingType === type : true))
    .filter((listing) => (budget ? listing.price <= budget : true))
    .filter((listing) => (beds ? listing.beds >= beds : true))
    .filter((listing) =>
      location
        ? listing.address.toLowerCase().includes(location.toLowerCase())
        : true,
    )
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);

  const filtersApplied = [
    type ? `${type === "rent" ? "Rent" : "Sale"} listings` : null,
    budget ? `Budget up to $${Math.round(budget).toLocaleString()}` : null,
    beds ? `${beds}+ bedrooms` : null,
    location ? `Location: ${location}` : null,
  ].filter((item): item is string => Boolean(item));

  const answer =
    filtered.length > 0
      ? `I found ${filtered.length} strong match${filtered.length > 1 ? "es" : ""}${filtersApplied.length > 0 ? ` using ${filtersApplied.join(", ")}` : ""}. Start with these and adjust your budget or location if you want more options.`
      : "I could not find exact matches yet. Try increasing budget, removing strict location, or reducing bedroom requirements for better results.";

  return NextResponse.json({
    data: {
      answer,
      filtersApplied,
      suggestedIds: filtered.map((item) => item.id),
    },
  });
}

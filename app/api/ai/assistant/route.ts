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

interface AssistantOutput {
  answer: string;
  filtersApplied: string[];
  suggestedIds: string[];
}

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

async function generateClaudeAnswer(input: {
  message: string;
  listings: z.infer<typeof listingSchema>[];
  filtersApplied: string[];
  suggestedTitles: string[];
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022";

  const payload = {
    model,
    max_tokens: 300,
    system:
      "You are a concise real-estate assistant. Keep responses practical and under 80 words.",
    messages: [
      {
        role: "user",
        content: `User request: ${input.message}\n\nFilters detected: ${
          input.filtersApplied.length > 0
            ? input.filtersApplied.join(", ")
            : "none"
        }\nTop matching listings: ${
          input.suggestedTitles.length > 0
            ? input.suggestedTitles.join(" | ")
            : "none"
        }\n\nWrite a short recommendation for the user and next adjustment they can try.`,
      },
    ],
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return null;
  }

  const parsed = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const text = parsed.content?.find((item) => item.type === "text")?.text;
  return text?.trim() || null;
}

function buildFallbackAnswer(input: {
  filteredCount: number;
  filtersApplied: string[];
}) {
  if (input.filteredCount > 0) {
    return `I found ${input.filteredCount} strong match${
      input.filteredCount > 1 ? "es" : ""
    }${
      input.filtersApplied.length > 0
        ? ` using ${input.filtersApplied.join(", ")}`
        : ""
    }. Start with these and adjust your budget or location if you want more options.`;
  }

  return "I could not find exact matches yet. Try increasing budget, removing strict location, or reducing bedroom requirements for better results.";
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

  const suggestedIds = filtered.map((item) => item.id);

  let answer = buildFallbackAnswer({
    filteredCount: filtered.length,
    filtersApplied,
  });

  try {
    const claudeAnswer = await generateClaudeAnswer({
      message,
      listings,
      filtersApplied,
      suggestedTitles: filtered.map((item) => item.title),
    });

    if (claudeAnswer) {
      answer = claudeAnswer;
    }
  } catch {
    // Fall back to deterministic assistant answer if Claude call fails.
  }

  const responseData: AssistantOutput = {
    answer,
    filtersApplied,
    suggestedIds,
  };

  return NextResponse.json({
    data: responseData,
  });
}

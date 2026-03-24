import { NextResponse } from "next/server";
import { z } from "zod";
import { getPersonalizedRecommendations } from "../../lib/listingsRepository";

const querySchema = z.object({
  clientId: z.string().min(1),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((value) => Number.parseInt(value, 10))
    .optional(),
  excludeIds: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse({
    clientId: searchParams.get("clientId") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    excludeIds: searchParams.get("excludeIds") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const excludeIds = parsed.data.excludeIds
    ? parsed.data.excludeIds
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const listings = await getPersonalizedRecommendations(parsed.data.clientId, {
    limit: parsed.data.limit ?? 3,
    excludeIds,
  });

  return NextResponse.json({ data: listings });
}

import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

const searchEventSchema = z.object({
  clientId: z.string().min(1),
  query: z.string().min(1),
  filters: z.record(z.string(), z.unknown()).optional(),
  resultIds: z.array(z.string()).max(50).optional(),
  clickedListingId: z.string().min(1).optional(),
});

function toAnonEmail(clientId: string) {
  return `anon+${clientId}@makaan.local`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = searchEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { clientId, query, filters, resultIds, clickedListingId } = parsed.data;
  const jsonFilters = filters as Prisma.InputJsonValue | undefined;

  const user = await prisma.appUser.upsert({
    where: { email: toAnonEmail(clientId) },
    update: {},
    create: {
      email: toAnonEmail(clientId),
      name: "Anonymous user",
    },
  });

  let validClickedListingId: string | undefined;
  if (clickedListingId) {
    const listing = await prisma.listing.findUnique({
      where: { id: clickedListingId },
      select: { id: true },
    });

    validClickedListingId = listing?.id;
  }

  const event = await prisma.searchEvent.create({
    data: {
      userId: user.id,
      query,
      filters: jsonFilters,
      topResultIds: resultIds ?? [],
      clickedListingId: validClickedListingId,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, eventId: event.id });
}

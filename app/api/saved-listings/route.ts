import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

const savedListingSchema = z.object({
  listingId: z.string().min(1),
  clientId: z.string().min(1),
});

const savedListingQuerySchema = z.object({
  clientId: z.string().min(1),
});

function toAnonEmail(clientId: string) {
  return `anon+${clientId}@makaan.local`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsed = savedListingQuerySchema.safeParse({
    clientId: searchParams.get("clientId") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await prisma.appUser.findUnique({
    where: { email: toAnonEmail(parsed.data.clientId) },
  });

  if (!user) {
    return NextResponse.json({ data: [] });
  }

  const saved = await prisma.savedListing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { listing: true },
  });

  return NextResponse.json({ data: saved.map((item) => item.listing) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = savedListingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { listingId, clientId } = parsed.data;

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const user = await prisma.appUser.upsert({
    where: { email: toAnonEmail(clientId) },
    update: {},
    create: {
      email: toAnonEmail(clientId),
      name: "Anonymous user",
    },
  });

  await prisma.savedListing.upsert({
    where: {
      userId_listingId: {
        userId: user.id,
        listingId,
      },
    },
    update: {},
    create: {
      userId: user.id,
      listingId,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = savedListingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { listingId, clientId } = parsed.data;

  const user = await prisma.appUser.findUnique({
    where: { email: toAnonEmail(clientId) },
  });

  if (!user) {
    return NextResponse.json({ ok: true });
  }

  await prisma.savedListing.deleteMany({
    where: {
      userId: user.id,
      listingId,
    },
  });

  return NextResponse.json({ ok: true });
}

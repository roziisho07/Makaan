import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getListings } from "@/app/lib/listingsRepository";
import { getCurrentAppUser } from "@/app/lib/getCurrentAppUser";

const createListingSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  price: z.number().int().positive(),
  address: z.string().min(5),
  beds: z.number().int().nonnegative(),
  baths: z.number().positive(),
  sqft: z.number().int().positive(),
  imageUrls: z.array(z.string().min(1)).min(1),
  neighborhood: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  listingType: z.enum(["sale", "rent"]),
  status: z.enum(["available", "pending", "sold"]).optional(),
});

const querySchema = z.object({
  q: z.string().optional(),
  listingType: z.enum(["all", "sale", "rent"]).optional(),
  status: z.enum(["all", "available", "pending", "sold"]).optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((value) => Number.parseInt(value, 10))
    .optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    listingType: searchParams.get("listingType") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const listings = await getListings({
    query: parsed.data.q,
    listingType: parsed.data.listingType,
    status: parsed.data.status,
    limit: parsed.data.limit,
  });

  return NextResponse.json({ data: listings });
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = createListingSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const appUser = await getCurrentAppUser();

    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const slugBase = parsed.data.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const listing = await prisma.listing.create({
      data: {
        id: nanoid(),
        slug: `${slugBase}-${nanoid(6)}`,
        userId: appUser.id,
        title: parsed.data.title,
        description: parsed.data.description,
        price: parsed.data.price,
        address: parsed.data.address,
        beds: parsed.data.beds,
        baths: parsed.data.baths,
        sqft: parsed.data.sqft,
        imageUrls: parsed.data.imageUrls,
        neighborhood: parsed.data.neighborhood,
        highlights: parsed.data.highlights,
        amenities: parsed.data.amenities,
        listingType: parsed.data.listingType,
        status: parsed.data.status ?? "available",
      },
    });

    return NextResponse.json({ data: listing }, { status: 201 });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 },
    );
  }
}

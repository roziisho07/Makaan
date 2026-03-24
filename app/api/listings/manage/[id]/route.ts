import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentAppUser } from "@/app/lib/getCurrentAppUser";

const updateListingSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().optional(),
  price: z.number().gt(0).optional(),
  address: z.string().min(5).optional(),
  beds: z.number().gt(0).optional(),
  baths: z.number().gt(0).optional(),
  sqft: z.number().gt(0).optional(),
  imageUrls: z.array(z.string().min(1)).optional(),
  neighborhood: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  listingType: z.enum(["sale", "rent"]).optional(),
  status: z.enum(["available", "pending", "sold"]).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUser = await getCurrentAppUser();

    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await context.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== appUser.id && appUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: listing });
  } catch (error) {
    console.error("Fetch listing error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUser = await getCurrentAppUser();

    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await context.params;

    // Get listing and verify ownership
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== appUser.id && appUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateListingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Update listing
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        ...parsed.data,
        updatedAt: new Date(),
      },
      include: { user: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUser = await getCurrentAppUser();

    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await context.params;

    // Get listing and verify ownership
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== appUser.id && appUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete listing
    await prisma.listing.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 },
    );
  }
}

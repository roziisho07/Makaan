import { NextResponse } from "next/server";
import { getListingBySlug } from "../../../lib/listingsRepository";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json({ data: listing });
}

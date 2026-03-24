import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentAppUser } from "@/app/lib/getCurrentAppUser";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUser = await getCurrentAppUser();

    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's listings
    const listings = await prisma.listing.findMany({
      where: { userId: appUser.id },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return NextResponse.json({ data: listings });
  } catch (error) {
    console.error("Fetch user listings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 },
    );
  }
}

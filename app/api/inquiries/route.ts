import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

const inquirySchema = z.object({
  listingId: z.string().min(1),
  message: z.string().min(10).max(1500),
  phone: z.string().max(32).optional(),
  name: z.string().max(120).optional(),
  email: z.string().email().optional(),
  clientId: z.string().min(1).optional(),
});

function toAnonEmail(clientId: string) {
  return `anon+${clientId}@makaan.local`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { listingId, message, phone, name, email, clientId } = parsed.data;

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  let userId: string | undefined;

  if (email || clientId) {
    const userEmail = email ?? toAnonEmail(clientId as string);

    const user = await prisma.appUser.upsert({
      where: { email: userEmail },
      update: {
        name: name ?? undefined,
      },
      create: {
        email: userEmail,
        name: name ?? "Anonymous user",
      },
    });

    userId = user.id;
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      listingId,
      userId,
      message,
      phone,
    },
  });

  return NextResponse.json({ ok: true, inquiryId: inquiry.id });
}

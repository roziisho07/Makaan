import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();

  if (email.includes("anon+")) {
    return NextResponse.json(
      { error: "This email is reserved" },
      { status: 400 },
    );
  }

  const existing = await prisma.appUser.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 },
    );
  }

  const passwordHash = await hash(parsed.data.password, 12);

  const user = await prisma.appUser.upsert({
    where: { email },
    update: {
      name: parsed.data.name,
      passwordHash,
    },
    create: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: "user",
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return NextResponse.json({ ok: true, user });
}

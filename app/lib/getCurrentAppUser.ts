import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getCurrentAppUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const existing = await prisma.appUser.findUnique({
    where: { clerkId: userId },
  });

  if (existing) {
    return existing;
  }

  const clerkUser = await currentUser();
  const email =
    clerkUser?.emailAddresses.find(
      (address) =>
        address.id === clerkUser.primaryEmailAddressId ||
        address.verification?.status === "verified",
    )?.emailAddress ?? `${userId}@clerk.local`;

  const created = await prisma.appUser.upsert({
    where: { email },
    update: {
      clerkId: userId,
      name: clerkUser?.fullName ?? clerkUser?.firstName ?? undefined,
    },
    create: {
      clerkId: userId,
      email,
      name: clerkUser?.fullName ?? clerkUser?.firstName ?? undefined,
      role: "user",
    },
  });

  return created;
}

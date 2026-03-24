import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get or create a test user
  const user = await prisma.appUser.findFirst({
    where: { email: "user@example.com" },
  });

  if (user) {
    const updated = await prisma.appUser.update({
      where: { id: user.id },
      data: { role: "admin" },
    });
    console.log(`✓ Promoted admin: ${updated.email} (${updated.role})`);
  } else {
    console.log("No user found with email user@example.com");
  }

  const all = await prisma.appUser.findMany({
    select: { id: true, email: true, role: true },
  });
  console.log("\nAll users in database:");
  all.forEach((u) => console.log(`  - ${u.email} (${u.role})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

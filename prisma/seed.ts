import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { sampleListings } from "../app/data/listings";

const prisma = new PrismaClient();

async function main() {
  const adminSeedEmail = process.env.ADMIN_SEED_EMAIL;
  const adminSeedPassword = process.env.ADMIN_SEED_PASSWORD;

  if (adminSeedEmail && adminSeedPassword) {
    const adminPasswordHash = await hash(adminSeedPassword, 10);

    await prisma.appUser.upsert({
      where: { email: adminSeedEmail },
      update: {
        passwordHash: adminPasswordHash,
        role: "admin",
      },
      create: {
        email: adminSeedEmail,
        passwordHash: adminPasswordHash,
        role: "admin",
        id: "admin-user-seed",
      },
    });

    console.log(`✓ Seeded admin user: ${adminSeedEmail}`);
  } else {
    console.log(
      "- Skipping admin seed; set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD to enable it.",
    );
  }

  // Seed listings
  for (const listing of sampleListings) {
    await prisma.listing.upsert({
      where: { id: listing.id },
      update: {
        slug: listing.slug,
        title: listing.title,
        price: listing.price,
        address: listing.address,
        beds: listing.beds,
        baths: listing.baths,
        sqft: listing.sqft,
        imageUrls: listing.imageUrls,
        description: listing.description,
        neighborhood: listing.neighborhood,
        highlights: listing.highlights ?? [],
        amenities: listing.amenities ?? [],
        isFeatured: listing.isFeatured ?? false,
        isNew: listing.isNew ?? false,
        rating: listing.rating,
        listingType: listing.listingType,
        status: listing.status ?? "available",
      },
      create: {
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        price: listing.price,
        address: listing.address,
        beds: listing.beds,
        baths: listing.baths,
        sqft: listing.sqft,
        imageUrls: listing.imageUrls,
        description: listing.description,
        neighborhood: listing.neighborhood,
        highlights: listing.highlights ?? [],
        amenities: listing.amenities ?? [],
        isFeatured: listing.isFeatured ?? false,
        isNew: listing.isNew ?? false,
        rating: listing.rating,
        listingType: listing.listingType,
        status: listing.status ?? "available",
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

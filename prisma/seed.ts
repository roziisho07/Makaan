import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { sampleListings } from "../app/data/listings";

const prisma = new PrismaClient();

async function main() {
  // Seed test admin user
  const adminPassword = await hash("admin123", 10);
  await prisma.appUser.upsert({
    where: { email: "admin@makaan.local" },
    update: {},
    create: {
      email: "admin@makaan.local",
      passwordHash: adminPassword,
      role: "admin",
      id: "admin-user-seed",
    },
  });
  console.log("✓ Seeded admin user: admin@makaan.local");

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

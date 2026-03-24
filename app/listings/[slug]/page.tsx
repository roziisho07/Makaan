import Link from "next/link";
import {
  Bath,
  Bed,
  CircleDot,
  MapPin,
  MoveRight,
  Square,
  Star,
} from "lucide-react";
import { getListingBySlugOrId } from "../../data/listings";
import { getListingBySlug, getListings } from "../../lib/listingsRepository";
import InquiryCard from "../../components/InquiryCard";
import ListingImageViewer from "../../components/ListingImageViewer";

interface ListingDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatPrice(price: number, type: "sale" | "rent") {
  return type === "rent"
    ? `$${price.toLocaleString()}/mo`
    : `$${price.toLocaleString()}`;
}

function getAISnapshot(listing: {
  price: number;
  listingType: "sale" | "rent";
  beds: number;
  baths: number;
  sqft: number;
  neighborhood?: string;
}) {
  const pricePerSqft = listing.price / Math.max(listing.sqft, 1);
  const densityLabel =
    listing.beds >= 4
      ? "family-sized layout"
      : listing.beds <= 2
        ? "compact urban fit"
        : "balanced mid-size layout";

  const valueLabel =
    listing.listingType === "sale"
      ? `${Math.round(pricePerSqft).toLocaleString()} USD per sqft`
      : `${pricePerSqft.toFixed(2)} USD per sqft monthly`;

  return [
    `${densityLabel} with ${listing.beds} bed / ${listing.baths} bath`,
    `pricing intensity: ${valueLabel}`,
    `neighborhood signal: ${listing.neighborhood ?? "location data limited"}`,
  ];
}

export default async function ListingDetailsPage({
  params,
}: ListingDetailsPageProps) {
  const { slug } = await params;
  const listing = (await getListingBySlug(slug)) ?? getListingBySlugOrId(slug);

  if (!listing) {
    return (
      <section className="section-padding">
        <div className="container-custom">
          <article className="card-soft rounded-2xl p-8 text-center">
            <h1 className="heading-2 mb-3">Listing not found</h1>
            <p className="text-muted mb-6">
              The property you are looking for does not exist or may have been
              removed.
            </p>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-semibold"
            >
              Browse Listings
              <MoveRight className="w-4 h-4" />
            </Link>
          </article>
        </div>
      </section>
    );
  }

  const similarListings = (
    await getListings({ listingType: listing.listingType })
  )
    .filter(
      (item) =>
        item.id !== listing.id && item.listingType === listing.listingType,
    )
    .slice(0, 3);

  const aiSnapshot = getAISnapshot(listing);

  return (
    <div>
      <section className="section-padding">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <ListingImageViewer
              title={listing.title}
              imageUrls={listing.imageUrls}
            />

            <article className="card-soft rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl font-semibold mb-3">Overview</h2>
              <p className="text-muted leading-relaxed mb-5">
                {listing.description ??
                  "A beautiful property in a great location with strong lifestyle value and modern comforts."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Highlights</h3>
                  <ul className="space-y-2 text-sm text-muted">
                    {(listing.highlights ?? []).map((item) => (
                      <li key={item} className="inline-flex items-center gap-2">
                        <CircleDot className="w-3.5 h-3.5 text-primary-500" />{" "}
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Amenities</h3>
                  <ul className="space-y-2 text-sm text-muted">
                    {(listing.amenities ?? []).map((item) => (
                      <li key={item} className="inline-flex items-center gap-2">
                        <CircleDot className="w-3.5 h-3.5 text-primary-500" />{" "}
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </div>

          <aside className="lg:col-span-2 card-soft rounded-3xl p-6 sm:p-8 h-fit">
            <p className="text-sm uppercase tracking-[0.15em] text-primary-500 font-semibold mb-3">
              {listing.listingType === "rent" ? "For Rent" : "For Sale"}
            </p>
            <h1 className="heading-2 mb-3">{listing.title}</h1>
            <p className="text-3xl font-bold text-primary-500 mb-4">
              {formatPrice(listing.price, listing.listingType)}
            </p>

            <p className="text-muted inline-flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" /> {listing.address}
            </p>
            <p className="text-sm text-muted mb-6">
              {listing.neighborhood ?? "Prime neighborhood"}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-center">
                <Bed className="w-4 h-4 mx-auto mb-1 text-primary-500" />
                <p className="text-sm font-medium">{listing.beds} Beds</p>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-center">
                <Bath className="w-4 h-4 mx-auto mb-1 text-primary-500" />
                <p className="text-sm font-medium">{listing.baths} Baths</p>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-center">
                <Square className="w-4 h-4 mx-auto mb-1 text-primary-500" />
                <p className="text-sm font-medium">
                  {listing.sqft.toLocaleString()} sqft
                </p>
              </div>
            </div>

            {typeof listing.rating === "number" && (
              <p className="inline-flex items-center gap-2 mb-6 text-sm font-medium">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {listing.rating} rating by recent visitors
              </p>
            )}

            <article className="rounded-2xl border border-primary-500/20 bg-primary-500/5 p-4 mb-6">
              <h2 className="text-sm uppercase tracking-[0.12em] text-primary-600 font-semibold mb-2">
                AI Snapshot
              </h2>
              <ul className="space-y-1 text-sm text-muted">
                {aiSnapshot.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>

            <div className="space-y-4">
              <InquiryCard listingId={listing.id} />
              <Link
                href="/listings"
                className="w-full inline-flex items-center justify-center px-5 py-3 border border-slate-300 dark:border-slate-600 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back to Listings
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container-custom">
          <h2 className="text-2xl font-semibold mb-4">Similar listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similarListings.map((item) => (
              <Link
                key={item.id}
                href={`/listings/${item.slug}`}
                className="card-soft rounded-2xl p-4 hover:-translate-y-0.5 transition-transform"
              >
                <p className="font-semibold mb-1">{item.title}</p>
                <p className="text-sm text-muted mb-2">{item.address}</p>
                <p className="text-primary-500 font-semibold">
                  {formatPrice(item.price, item.listingType)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

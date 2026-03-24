import ListingCard from "./ListingCard";
import type { Listing } from "../types/listing";
import { getListingPath } from "../data/listings";

interface RecommendedForYouProps {
  listings: Listing[];
  isSaved: (listingId: string) => boolean;
  onView: (listingId: string) => void;
  onSave: (listingId: string, saved: boolean) => void;
}

function RecommendedForYou({
  listings,
  isSaved,
  onView,
  onSave,
}: RecommendedForYouProps) {
  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-white dark:bg-neutral-950">
      <div className="container-custom">
        <div className="mb-10">
          <h2 className="heading-2 mb-3">Recommended For You</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Picked using the homes you viewed and saved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              {...listing}
              href={getListingPath(listing)}
              saved={isSaved(listing.id)}
              onClick={() => onView(listing.id)}
              onSave={(saved) => onSave(listing.id, saved)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default RecommendedForYou;

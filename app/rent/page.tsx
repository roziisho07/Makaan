import ListingCatalog from "../components/ListingCatalog";
import PageIntro from "../components/PageIntro";
import { getListings } from "../lib/listingsRepository";

async function RentPage() {
  const rentalListings = await getListings({ listingType: "rent" });

  return (
    <div>
      <PageIntro
        eyebrow="Rent"
        title="Flexible rental options in top locations"
        description="Find apartments, condos, and homes for rent with transparent monthly pricing and feature breakdowns."
      />

      <section className="section-padding">
        <div className="container-custom">
          <ListingCatalog
            listings={rentalListings}
            showTypeFilter={false}
            emptyLabel="No rentals match your current filters."
          />
        </div>
      </section>
    </div>
  );
}

export default RentPage;

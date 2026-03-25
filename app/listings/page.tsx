import ListingCatalog from "../components/ListingCatalog";
import PageIntro from "../components/PageIntro";
import { getListings } from "../lib/listingsRepository";

export const dynamic = "force-dynamic";

async function ListingsPage() {
  const listings = await getListings();

  return (
    <div>
      <PageIntro
        eyebrow="Property directory"
        title="Browse every listing in one place"
        description="Explore all available homes and rentals with rich details, modern cards, and clean responsive browsing."
      />

      <section className="section-padding">
        <div className="container-custom">
          <ListingCatalog listings={listings} showTypeFilter />
        </div>
      </section>
    </div>
  );
}

export default ListingsPage;

import ListingCatalog from "../components/ListingCatalog";
import PageIntro from "../components/PageIntro";
import { getListings } from "../lib/listingsRepository";

export const dynamic = "force-dynamic";

async function BuyPage() {
  const buyListings = await getListings({ listingType: "sale" });

  return (
    <div>
      <PageIntro
        eyebrow="Buy"
        title="Homes for sale tailored to your goals"
        description="From first homes to premium properties, discover sale listings with clear pricing and neighborhood context."
      />

      <section className="section-padding">
        <div className="container-custom">
          <ListingCatalog
            listings={buyListings}
            showTypeFilter={false}
            emptyLabel="No homes for sale match your current filters."
          />
        </div>
      </section>
    </div>
  );
}

export default BuyPage;

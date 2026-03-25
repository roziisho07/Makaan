import React from "react";
import Hero from "./components/Hero";
import MainListing from "./components/MianListing";
import { getListings } from "./lib/listingsRepository";

export const dynamic = "force-dynamic";

async function Home() {
  const listings = await getListings();

  return (
    <div className="pb-10">
      <Hero />
      <div className="container-custom mt-8">
        <MainListing listings={listings} />
      </div>
    </div>
  );
}

export default Home;

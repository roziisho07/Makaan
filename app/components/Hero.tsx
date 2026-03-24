import Image from "next/image";
import React from "react";
import { Search, MapPin } from "lucide-react";

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 border border-slate-200/70 dark:border-slate-700/50">
      <div className="absolute inset-0">
        <Image
          src="/heroimage.jpg"
          alt="Beautiful homes background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-backdrop" />
      </div>

      <div className="relative container-custom py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          <p className="uppercase tracking-[0.2em] text-xs sm:text-sm text-white/75 font-semibold mb-4">
            Intelligent property discovery
          </p>
          <h1 className="heading-1 text-white mb-5">
            Find the right home faster with a cleaner, smarter search.
          </h1>
          <p className="text-base sm:text-xl text-white/90 mb-7 max-w-2xl">
            Browse listings, compare options, and get personalized
            recommendations across sale and rental markets.
          </p>

          <div className="space-y-3 max-w-2xl card-soft rounded-2xl p-3 sm:p-4 bg-white/95">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-slate-600">
                Search across homes, rentals, and properties
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Try: 3 bed home under 700k in Austin"
                  className="w-full px-5 py-3.5 pr-12 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <button className="px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Explore
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {["For Sale", "For Rent", "New This Week", "Open House"].map(
                (filter) => (
                  <button
                    key={filter}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-full transition-colors border border-slate-200"
                  >
                    {filter}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

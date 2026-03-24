"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Listing } from "@prisma/client";
import {
  Pencil,
  Trash2,
  Plus,
  ImageIcon,
  DollarSign,
  MapPin,
} from "lucide-react";

export default function MyListingsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      router.push("/auth/signin");
      return;
    }

    if (isSignedIn) {
      void (async () => {
        try {
          const response = await fetch("/api/user/listings", {
            cache: "no-store",
          });
          if (response.status === 401) {
            router.push("/auth/signin");
            return;
          }

          if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as {
              error?: string;
            } | null;
            throw new Error(payload?.error ?? "Failed to fetch");
          }

          const { data } = await response.json();
          setListings(data);
        } catch (error) {
          console.error("Fetch error:", error);
          alert(
            error instanceof Error ? error.message : "Failed to load listings",
          );
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isLoaded, isSignedIn, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const response = await fetch(`/api/listings/manage/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setListings((prev) => prev.filter((l) => l.id !== id));
      alert("Listing deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete listing");
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            My Listings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your property listings
          </p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          <Plus className="h-5 w-5" />
          Create Listing
        </Link>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No listings yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first property listing to get started
          </p>
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            <Plus className="h-5 w-5" />
            Create First Listing
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
            >
              {/* Image */}
              <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
                {listing.imageUrls[0] ? (
                  <Image
                    src={listing.imageUrls[0]}
                    alt={listing.title}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">
                  {listing.listingType === "rent" ? "For Rent" : "For Sale"}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                  {listing.title}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
                  <DollarSign className="h-5 w-5" />
                  {listing.price.toLocaleString()}
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 mb-3">
                  <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{listing.address}</span>
                </div>

                {/* Details */}
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>🛏️ {listing.beds} bed</span>
                  <span>🚿 {listing.baths} bath</span>
                  <span>📐 {listing.sqft.toLocaleString()} sqft</span>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-semibold text-white ${
                      listing.status === "available"
                        ? "bg-green-600"
                        : listing.status === "pending"
                          ? "bg-yellow-600"
                          : "bg-red-600"
                    }`}
                  >
                    {listing.status.charAt(0).toUpperCase() +
                      listing.status.slice(1)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/listings/${listing.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 font-semibold py-2 rounded transition"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 font-semibold py-2 rounded transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>

                {/* View Listing */}
                <Link
                  href={`/listings/${listing.slug}`}
                  className="block text-center mt-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition"
                >
                  View Public Listing →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

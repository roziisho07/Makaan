"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Listing } from "@prisma/client";
import ListingForm from "@/app/components/ListingForm";

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoaded, isSignedIn } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      router.push("/auth/signin");
      return;
    }

    if (isSignedIn && params.id) {
      void (async () => {
        try {
          const response = await fetch(`/api/listings/manage/${params.id}`, {
            cache: "no-store",
          });
          if (!response.ok) {
            throw new Error("Failed to fetch");
          }

          const { data } = await response.json();
          setListing(data);
        } catch (error) {
          console.error("Fetch error:", error);
          alert("Failed to load listing");
          router.push("/dashboard/listings");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isLoaded, isSignedIn, router, params.id]);

  if (!isLoaded || !isSignedIn || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Listing not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Edit Listing
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Update your property information
      </p>
      <ListingForm initialData={listing} isEditing />
    </div>
  );
}

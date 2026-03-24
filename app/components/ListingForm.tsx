"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Listing, ListingType, ListingStatus } from "@prisma/client";
import { Upload, X } from "lucide-react";

interface ListingFormProps {
  initialData?: Listing;
  isEditing?: boolean;
}

export default function ListingForm({
  initialData,
  isEditing = false,
}: ListingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>(initialData?.imageUrls || []);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price.toString() || "",
    address: initialData?.address || "",
    neighborhood: initialData?.neighborhood || "",
    beds: initialData?.beds.toString() || "",
    baths: initialData?.baths.toString() || "",
    sqft: initialData?.sqft.toString() || "",
    listingType:
      (initialData?.listingType as ListingType) || ("sale" as ListingType),
    status:
      (initialData?.status as ListingStatus) || ("available" as ListingStatus),
    highlights: initialData?.highlights?.join(", ") || "",
    amenities: initialData?.amenities?.join(", ") || "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const { url } = await response.json();
        setImages((prev) => [...prev, url]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isEditing
        ? `/api/listings/manage/${initialData?.id}`
        : "/api/listings";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number.parseInt(formData.price),
          beds: Number.parseInt(formData.beds),
          baths: Number.parseFloat(formData.baths),
          sqft: Number.parseInt(formData.sqft),
          imageUrls: images,
          highlights: formData.highlights
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean),
          amenities: formData.amenities
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save listing");
      }

      await response.json();
      router.push("/dashboard/listings");
      router.refresh();
    } catch (error) {
      console.error("Error saving listing:", error);
      alert(error instanceof Error ? error.message : "Failed to save listing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Images */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Images
        </label>
        <div className="space-y-4">
          {/* Upload Area */}
          <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG up to 5MB
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                >
                  <Image
                    src={image}
                    width={96}
                    height={96}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Uploading...
            </p>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Title
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="e.g., Modern 3BR Home in Downtown"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Price ($)
          </label>
          <input
            type="number"
            required
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="0"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Address
        </label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="123 Main St, City, State"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Description
        </label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Describe your property..."
        />
      </div>

      {/* Property Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Bedrooms
          </label>
          <input
            type="number"
            required
            value={formData.beds}
            onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Bathrooms
          </label>
          <input
            type="number"
            step="0.5"
            required
            value={formData.baths}
            onChange={(e) =>
              setFormData({ ...formData, baths: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Square Feet
          </label>
          <input
            type="number"
            required
            value={formData.sqft}
            onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Neighborhood
          </label>
          <input
            type="text"
            value={formData.neighborhood}
            onChange={(e) =>
              setFormData({ ...formData, neighborhood: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="e.g., Downtown, Suburbs"
          />
        </div>
      </div>

      {/* Type & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Listing Type
          </label>
          <select
            required
            value={formData.listingType}
            onChange={(e) =>
              setFormData({
                ...formData,
                listingType: e.target.value as ListingType,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Status
          </label>
          <select
            required
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as ListingStatus,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold/Rented</option>
          </select>
        </div>
      </div>

      {/* Highlights & Amenities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Highlights (comma-separated)
          </label>
          <textarea
            rows={3}
            value={formData.highlights}
            onChange={(e) =>
              setFormData({ ...formData, highlights: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="e.g., Hardwood floors, Updated kitchen, Garden"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Amenities (comma-separated)
          </label>
          <textarea
            rows={3}
            value={formData.amenities}
            onChange={(e) =>
              setFormData({ ...formData, amenities: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="e.g., Parking, Pool, Gym"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading || uploading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
        >
          {isLoading
            ? "Saving..."
            : isEditing
              ? "Update Listing"
              : "Create Listing"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold py-3 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

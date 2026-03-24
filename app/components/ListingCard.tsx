"use client";
// components/ListingCard.tsx
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Heart,
  Share2,
  Star,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrls: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  rating?: number;
  listingType: "sale" | "rent";
  status?: "available" | "pending" | "sold";
  onClick?: () => void;
  onSave?: (saved: boolean) => void;
  onShare?: () => void;
  saved?: boolean;
  href?: string;
}

function ListingCard({
  title,
  price,
  address,
  beds,
  baths,
  sqft,
  imageUrls,
  isFeatured = false,
  isNew = false,
  rating,
  listingType,
  status = "available",
  onClick,
  onSave,
  onShare,
  saved,
  href,
}: ListingCardProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [localSaved, setLocalSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isSaved = saved ?? localSaved;

  const formatPrice = (price: number, type: "sale" | "rent") => {
    if (type === "rent") {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning-500";
      case "sold":
        return "bg-error-500";
      default:
        return "bg-success-500";
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + imageUrls.length) % imageUrls.length,
    );
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSaved = !isSaved;
    if (saved === undefined) {
      setLocalSaved(nextSaved);
    }
    onSave?.(nextSaved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.();
  };

  const handleCardClick = () => {
    onClick?.();
    if (href) {
      router.push(href);
    }
  };

  return (
    <div
      className="group bg-white dark:bg-neutral-900 rounded-xl shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          handleCardClick();
        }
      }}
      role={href ? "link" : "button"}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        {/* Main Image */}
        <Image
          src={imageUrls[currentImageIndex] || "/heroimage.jpg"}
          alt={title}
          fill
          className={`object-cover transition-transform duration-700 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Image Navigation Arrows - Show on hover */}
        {imageUrls.length > 1 && isHovered && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {imageUrls.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm flex items-center gap-1">
            <Camera className="w-3 h-3" />
            <span>
              {currentImageIndex + 1}/{imageUrls.length}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isFeatured && (
            <span className="px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full shadow-lg">
              Featured
            </span>
          )}
          {isNew && (
            <span className="px-3 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full shadow-lg">
              New
            </span>
          )}
          {status !== "available" && (
            <span
              className={`px-3 py-1 ${getStatusColor(status)} text-white text-xs font-semibold rounded-full shadow-lg uppercase`}
            >
              {status}
            </span>
          )}
        </div>

        {/* Listing Type Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-900 dark:text-white text-xs font-semibold rounded-full shadow-lg">
            {listingType === "rent" ? "For Rent" : "For Sale"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-neutral-800 transition-colors shadow-lg"
            aria-label="Share property"
          >
            <Share2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
          </button>
          <button
            onClick={handleSave}
            className="p-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-neutral-800 transition-colors shadow-lg"
            aria-label="Save property"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isSaved
                  ? "fill-error-500 text-error-500"
                  : "text-neutral-700 dark:text-neutral-300"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price and Rating */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatPrice(price, listingType)}
            </p>
            {listingType === "rent" && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                + utilities and fees
              </p>
            )}
          </div>
          {rating && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <Star className="w-4 h-4 fill-primary-500 text-primary-500" />
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                {rating}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-1">
          {title}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-1 mb-3">
          <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
            {address}
          </p>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {beds} {beds === 1 ? "Bed" : "Beds"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {baths} {baths === 1 ? "Bath" : "Baths"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Square className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {sqft.toLocaleString()} sqft
            </span>
          </div>
        </div>

        {/* Agent/Broker Info (Optional) */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">
                JD
              </span>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              John Doe • Broker
            </span>
          </div>
          <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}

export default ListingCard;

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ListingImageViewerProps {
  title: string;
  imageUrls: string[];
}

export default function ListingImageViewer({
  title,
  imageUrls,
}: ListingImageViewerProps) {
  const images = useMemo(() => {
    const filtered = imageUrls.filter(Boolean);
    return filtered.length > 0 ? filtered : ["/heroimage.jpg"];
  }, [imageUrls]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeImage = images[activeIndex] ?? "/heroimage.jpg";

  const openModalAt = (index: number) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => openModalAt(activeIndex)}
          className="w-full rounded-3xl overflow-hidden border border-slate-200/70 dark:border-slate-700/60 bg-white dark:bg-slate-900 text-left"
        >
          <div className="relative h-80 sm:h-105">
            <Image
              src={activeImage}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </button>

        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((imageUrl, index) => (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  openModalAt(index);
                }}
                className={`shrink-0 rounded-2xl overflow-hidden border ${
                  index === activeIndex
                    ? "border-primary-500"
                    : "border-slate-200/70 dark:border-slate-700/60"
                }`}
              >
                <div className="relative w-28 h-20 sm:w-36 sm:h-24">
                  <Image
                    src={imageUrl}
                    alt={`${title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white"
            aria-label="Close image viewer"
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-3 md:left-6 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="relative w-full max-w-6xl h-[70vh] md:h-[80vh]">
            <Image
              src={activeImage}
              alt={`${title} full image ${activeIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-3 md:right-6 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}

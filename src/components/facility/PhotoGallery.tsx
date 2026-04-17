"use client";

import Image from "next/image";
import { useState } from "react";

interface PhotoGalleryProps {
  photos: string[];
  facilityName: string;
}

export default function PhotoGallery({ photos, facilityName }: PhotoGalleryProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!photos || photos.length === 0) return null;

  // Up to 6 in grid; lightbox covers all of them
  const visible = photos.slice(0, 6);
  const remaining = Math.max(0, photos.length - 6);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-card sm:grid-cols-4 sm:grid-rows-2">
        {/* Hero image — spans 2x2 on desktop */}
        <button
          onClick={() => setActiveIdx(0)}
          className="relative aspect-[4/3] overflow-hidden rounded-l-card sm:col-span-2 sm:row-span-2 sm:aspect-auto"
          aria-label={`Open photo 1 of ${photos.length}`}
        >
          <Image
            src={visible[0]}
            alt={`${facilityName} photo 1`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            unoptimized
          />
        </button>

        {/* Thumbnails */}
        {visible.slice(1, 5).map((url, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i + 1)}
            className="relative aspect-[4/3] overflow-hidden"
            aria-label={`Open photo ${i + 2} of ${photos.length}`}
          >
            <Image
              src={url}
              alt={`${facilityName} photo ${i + 2}`}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
              unoptimized
            />
            {i === 3 && remaining > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                +{remaining} more
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {activeIdx !== null && (
        <div
          onClick={() => setActiveIdx(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${activeIdx + 1} of ${photos.length}`}
        >
          <button
            onClick={() => setActiveIdx(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          </button>

          {/* Prev */}
          {activeIdx > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx(activeIdx - 1);
              }}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4l-6 6 6 6" />
              </svg>
            </button>
          )}

          {/* Next */}
          {activeIdx < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx(activeIdx + 1);
              }}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 4l6 6-6 6" />
              </svg>
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative h-[85vh] w-full max-w-5xl"
          >
            <Image
              src={photos[activeIdx]}
              alt={`${facilityName} photo ${activeIdx + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              unoptimized
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
            {activeIdx + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}

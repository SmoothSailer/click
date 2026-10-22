"use client";

import { useState } from "react";

import type { TruckImage } from "@/lib/types";
import { ImageIcon } from "./icons";

export function TruckGallery({
  images,
  title,
}: {
  images: TruckImage[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl bg-ink-100 text-ink-300">
        <ImageIcon className="size-12" />
        <span className="text-sm font-medium">
          No photos uploaded for this truck yet
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- photos are pre-resized to webp on upload and served from local disk */}
        <img
          src={current.src}
          alt={title}
          width={1600}
          height={1200}
          decoding="async"
          className="h-full w-full object-cover"
        />
        {images.length > 1 ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-medium text-white">
            {active + 1} / {images.length}
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1} of ${images.length}`}
              aria-current={index === active}
              className={`aspect-[4/3] overflow-hidden rounded-lg border-2 transition ${
                index === active
                  ? "border-accent-500"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails are pre-resized to webp on upload */}
              <img
                src={image.thumb}
                alt=""
                width={200}
                height={150}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

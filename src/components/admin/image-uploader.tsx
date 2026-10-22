"use client";

import { useRef, useState } from "react";

import { type TruckImage } from "@/lib/types";
import { CloseIcon, ImageIcon, SpinnerIcon, StarIcon } from "@/components/icons";

export function ImageUploader({
  images,
  onChange,
}: {
  images: TruckImage[];
  onChange: (images: TruckImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const body = new FormData();
    for (const file of Array.from(files)) {
      body.append("files", file);
    }

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as {
        images?: TruckImage[];
        error?: string;
      };

      if (!response.ok || !payload.images) {
        throw new Error(payload.error || "The photos could not be uploaded.");
      }

      onChange([...images, ...payload.images]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The photos could not be uploaded.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(index: number) {
    onChange(images.filter((_, position) => position !== index));
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    onChange([selected, ...next]);
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Photos
        </span>
        <span className="text-xs text-ink-400">
          {images.length}/12 &middot; the first photo is the cover
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={image.src}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-200 bg-ink-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-resized thumbnails served from local disk */}
            <img
              src={image.thumb}
              alt={`Truck photo ${index + 1}`}
              className="h-full w-full object-cover"
            />

            {index === 0 ? (
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent-500 px-2 py-0.5 text-[11px] font-semibold text-ink-950">
                <StarIcon className="size-3" />
                Cover
              </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-ink-950/80 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
              {index !== 0 ? (
                <button
                  type="button"
                  onClick={() => makeCover(index)}
                  className="rounded bg-white/90 px-2 py-1 text-[11px] font-semibold text-ink-900 transition hover:bg-white"
                >
                  Make cover
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove photo ${index + 1}`}
                className="rounded bg-white/90 p-1 text-ink-900 transition hover:bg-white"
              >
                <CloseIcon className="size-3.5" />
              </button>
            </div>
          </div>
        ))}

        <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-ink-300 bg-white text-ink-500 transition hover:border-ink-400 hover:text-ink-700">
          {uploading ? (
            <>
              <SpinnerIcon className="size-6" />
              <span className="text-xs font-medium">Uploading&hellip;</span>
            </>
          ) : (
            <>
              <ImageIcon className="size-6" />
              <span className="text-xs font-medium">Add photos</span>
              <span className="text-[11px] text-ink-400">JPG, PNG, WEBP</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={(event) => void upload(event.target.files)}
          />
        </label>
      </div>

      {error ? (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {images.length > 0 ? (
        <p className="mt-2 text-xs text-ink-400">
          Removing a photo here deletes the file from disk when you save.
        </p>
      ) : (
        <p className="mt-2 text-xs text-ink-400">
          No photos yet. Listings without photos still show a placeholder.
        </p>
      )}
    </div>
  );
}

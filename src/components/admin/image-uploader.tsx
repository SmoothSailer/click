"use client";

import { useRef, useState } from "react";

import { type TruckImage } from "@/lib/types";
import { CloseIcon, ImageIcon, SpinnerIcon, StarIcon } from "@/components/icons";

const MAX_IMAGES = 12;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

type UploadPayload = {
  images?: TruckImage[];
  error?: string;
};

async function readPayload(response: Response): Promise<UploadPayload> {
  const text = await response.text();

  let payload: UploadPayload | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as UploadPayload;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Your admin session expired. Sign in again and retry the upload.",
      );
    }
    if (response.status === 413) {
      throw new Error("That photo is too large for the server.");
    }
    throw new Error(
      payload?.error ||
        `The photo could not be uploaded (error ${response.status}). Please try again.`,
    );
  }

  if (!payload || !payload.images) {
    throw new Error(
      "The server returned an unexpected response. Restart the app and try again.",
    );
  }

  return payload;
}

export function ImageUploader({
  images,
  onChange,
}: {
  images: TruckImage[];
  onChange: (images: TruckImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (busyRef.current || !files || files.length === 0) return;

    const available = MAX_IMAGES - images.length;
    if (available <= 0) {
      setError(
        `You can add up to ${MAX_IMAGES} photos. Remove one before uploading another.`,
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const problems: string[] = [];
    const valid: File[] = [];

    for (const file of Array.from(files)) {
      if (file.type && !ALLOWED_TYPES.has(file.type)) {
        problems.push(`"${file.name}" is not a supported image format.`);
      } else if (file.size > MAX_FILE_SIZE) {
        problems.push(`"${file.name}" is larger than 10 MB.`);
      } else {
        valid.push(file);
      }
    }

    if (valid.length > available) {
      problems.push(`Only ${available} more photo${available === 1 ? "" : "s"} can be added.`);
    }

    const selected = valid.slice(0, available);
    if (selected.length === 0) {
      setError(problems.slice(0, 2).join(" "));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    busyRef.current = true;
    setUploading(true);
    setError(null);

    const uploaded: TruckImage[] = [];

    try {
      // Upload one photo per request. A single large multipart request can
      // hit proxy or hosting body limits, which returns an empty response and
      // surfaces in the browser as "Unexpected end of JSON input".
      for (const [index, file] of selected.entries()) {
        setProgress(`Uploading ${index + 1} of ${selected.length}…`);

        try {
          const body = new FormData();
          body.append("files", file);

          const response = await fetch("/api/admin/upload", {
            method: "POST",
            body,
          });
          const payload = await readPayload(response);
          uploaded.push(...(payload.images ?? []));
        } catch (uploadError) {
          problems.push(
            uploadError instanceof Error
              ? uploadError.message
              : `"${file.name}" could not be uploaded.`,
          );
        }
      }
    } finally {
      busyRef.current = false;
      setUploading(false);
      setProgress(null);
      if (uploaded.length > 0) onChange([...images, ...uploaded]);
      if (problems.length > 0) setError(problems.slice(0, 2).join(" "));
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
      <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Photos
        </span>
        <span className="text-xs text-ink-400">
          {images.length}/{MAX_IMAGES} &middot; the first photo is the cover
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
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

            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-ink-950/80 to-transparent p-2 opacity-100 transition md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
              {index !== 0 ? (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => makeCover(index)}
                  className="rounded bg-white/90 px-2 py-1.5 text-[11px] font-semibold text-ink-900 transition hover:bg-white disabled:opacity-60"
                >
                  Make cover
                </button>
              ) : null}
              <button
                type="button"
                disabled={uploading}
                onClick={() => remove(index)}
                aria-label={`Remove photo ${index + 1}`}
                className="rounded bg-white/90 p-2 text-ink-900 transition hover:bg-white disabled:opacity-60"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
          </div>
        ))}

        <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-ink-300 bg-white px-2 text-center text-ink-500 transition hover:border-ink-400 hover:text-ink-700">
          {uploading ? (
            <>
              <SpinnerIcon className="size-6" />
              <span className="text-xs font-medium">
                {progress ?? "Uploading…"}
              </span>
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
        <p
          role="alert"
          className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
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

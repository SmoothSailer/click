import Link from "next/link";

import { formatKm, formatPrice } from "@/lib/format";
import type { Truck } from "@/lib/types";
import { ImageIcon, StarIcon } from "./icons";

function Placeholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-100 text-ink-300">
      <ImageIcon className="size-10" />
      <span className="text-xs font-medium">Photo coming soon</span>
    </div>
  );
}

export function TruckCard({ truck }: { truck: Truck }) {
  const cover = truck.images[0];

  return (
    <Link
      href={`/trucks/${truck.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- photos are pre-resized to webp on upload and served from local disk
          <img
            src={cover.thumb}
            alt={truck.title}
            width={600}
            height={450}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <Placeholder />
        )}

        {truck.featured ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-semibold text-ink-950 shadow-sm">
            <StarIcon className="size-3.5" />
            Featured
          </span>
        ) : null}

        {truck.status !== "available" ? (
          <span className="absolute right-3 top-3 rounded-full bg-ink-950/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {truck.status}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug text-ink-950 group-hover:text-accent-700">
          {truck.title}
        </h3>

        <dl className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          {truck.year ? (
            <div className="flex gap-1">
              <dt className="sr-only">Year</dt>
              <dd>{truck.year}</dd>
            </div>
          ) : null}
          {truck.mileageKm !== null ? (
            <div className="flex gap-1">
              <dt className="sr-only">Mileage</dt>
              <dd>{formatKm(truck.mileageKm)}</dd>
            </div>
          ) : null}
          {truck.bodyType ? (
            <div className="flex gap-1">
              <dt className="sr-only">Body type</dt>
              <dd>{truck.bodyType}</dd>
            </div>
          ) : null}
          {truck.location ? (
            <div className="flex gap-1">
              <dt className="sr-only">Location</dt>
              <dd>{truck.location}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-auto pt-4 text-xl font-bold text-ink-950">
          {formatPrice(truck.price, truck.currency)}
        </p>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { Suspense } from "react";

import { FilterBar } from "@/components/filter-bar";
import { TruckCard } from "@/components/truck-card";
import { parseFilters, type RawSearchParams } from "@/lib/filters";
import { getFilterOptions, listPublicTrucks } from "@/lib/trucks";

export default function HomePage(props: PageProps<"/">) {
  return (
    <>
      <Hero />
      <section id="trucks" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
        <Suspense fallback={<CatalogSkeleton />}>
          <TruckCatalog searchParams={props.searchParams} />
        </Suspense>
      </section>
      <HowItWorks />
    </>
  );
}

function Hero() {
  return (
    <section className="border-b border-ink-800 bg-ink-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">
          Trucks for sale
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          Find the right truck, then close the deal on WhatsApp.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-ink-300 sm:text-lg">
          Every listing carries real photos, the mileage on the clock and a
          straight price. Pick the truck you want, hit buy, and finish the
          conversation with us on WhatsApp.
        </p>
        <a
          href="#trucks"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-accent-500 px-5 py-3 text-sm font-semibold text-ink-950 shadow-sm transition hover:bg-accent-400"
        >
          Browse available trucks
        </a>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Browse photos and specs",
      body: "Filter by make, body type, year and price until the shortlist looks right.",
    },
    {
      title: "Open the listing",
      body: "Check the full photo gallery, mileage, ownership and the seller's description.",
    },
    {
      title: "Buy on WhatsApp",
      body: "Tap the buy button and we pick up the chat with the truck details already filled in.",
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold tracking-tight text-ink-950">
          How buying works
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-ink-200 p-5">
              <span className="flex size-8 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-ink-950">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold text-ink-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

async function TruckCatalog({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);

  const [trucks, options] = await Promise.all([
    listPublicTrucks(filters),
    getFilterOptions(),
  ]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-ink-950">
          Available trucks
          <span className="ml-2 text-base font-medium text-ink-400">
            {trucks.length} {trucks.length === 1 ? "truck" : "trucks"}
          </span>
        </h2>
        <p className="text-sm text-ink-500">
          Prices on request? No — every truck shows a straight asking price.
        </p>
      </div>

      <FilterBar options={options} filters={filters} />

      <div className="mt-6">
        {trucks.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trucks.map((truck) => (
              <TruckCard key={truck.id} truck={truck} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
      <h3 className="text-lg font-semibold text-ink-900">
        No trucks match those filters
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
        Try widening the price range or clearing a filter. New stock is added
        regularly, so it is worth checking back.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-lg border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
      >
        Clear all filters
      </Link>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div>
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-ink-200" />
      <div className="h-40 animate-pulse rounded-xl bg-ink-200/70" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-xl bg-ink-200/70"
          />
        ))}
      </div>
    </div>
  );
}

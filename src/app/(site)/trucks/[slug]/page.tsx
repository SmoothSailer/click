import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArrowLeftIcon } from "@/components/icons";
import { TruckCard } from "@/components/truck-card";
import { TruckGallery } from "@/components/truck-gallery";
import { WhatsAppBuyButton } from "@/components/whatsapp-buy-button";
import { formatKm, formatPrice, formatTons } from "@/lib/format";
import { getTruckBySlug, listPublicTrucks } from "@/lib/trucks";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export async function generateMetadata(
  props: PageProps<"/trucks/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const truck = await getTruckBySlug(slug);

  if (!truck) {
    return { title: "Truck not found" };
  }

  return {
    title: truck.title,
    description: `${truck.title} for sale at ${formatPrice(
      truck.price,
      truck.currency,
    )}. ${truck.year ?? ""} ${truck.make} ${truck.model} with ${formatKm(
      truck.mileageKm,
    )}. Inspect the photos and buy on WhatsApp.`,
    openGraph: {
      title: truck.title,
      description: `${truck.year ?? ""} ${truck.make} ${truck.model} — ${formatPrice(
        truck.price,
        truck.currency,
      )}`,
      images: truck.images[0] ? [truck.images[0].src] : undefined,
    },
  };
}

export default function TruckPage(props: PageProps<"/trucks/[slug]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<DetailSkeleton />}>
        <TruckDetail params={props.params} />
      </Suspense>
    </div>
  );
}

async function TruckDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const truck = await getTruckBySlug(slug);

  if (!truck) notFound();

  const whatsappLink = buildWhatsAppLink(truck);
  const similar = (
    await listPublicTrucks(truck.make ? { make: truck.make } : {})
  )
    .filter((other) => other.id !== truck.id)
    .slice(0, 3);

  const sold = truck.status !== "available";

  return (
    <>
      <Link
        href="/#trucks"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeftIcon className="size-4" />
        Back to all trucks
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div>
          <TruckGallery images={truck.images} title={truck.title} />

          {truck.description ? (
            <section className="mt-8 rounded-xl border border-ink-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-ink-950">
                Seller&apos;s description
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-600">
                {truck.description}
              </p>
            </section>
          ) : null}

          <section className="mt-6 rounded-xl border border-ink-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-ink-950">
              Specifications
            </h2>
            <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {specRows(truck).map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 border-b border-ink-100 pb-2"
                >
                  <dt className="text-sm text-ink-500">{row.label}</dt>
                  <dd className="text-sm font-medium text-ink-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-sm">
            {sold ? (
              <span className="inline-flex items-center rounded-full bg-ink-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {truck.status}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                Available
              </span>
            )}

            <h1 className="mt-3 text-xl font-bold leading-snug text-ink-950">
              {truck.title}
            </h1>

            <p className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
              {formatPrice(truck.price, truck.currency)}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-ink-50 p-3">
                <dt className="text-xs text-ink-500">Year</dt>
                <dd className="mt-0.5 font-semibold text-ink-900">
                  {truck.year ?? "—"}
                </dd>
              </div>
              <div className="rounded-lg bg-ink-50 p-3">
                <dt className="text-xs text-ink-500">Mileage</dt>
                <dd className="mt-0.5 font-semibold text-ink-900">
                  {formatKm(truck.mileageKm)}
                </dd>
              </div>
              <div className="rounded-lg bg-ink-50 p-3">
                <dt className="text-xs text-ink-500">Fuel</dt>
                <dd className="mt-0.5 font-semibold text-ink-900">
                  {truck.fuelType || "—"}
                </dd>
              </div>
              <div className="rounded-lg bg-ink-50 p-3">
                <dt className="text-xs text-ink-500">Transmission</dt>
                <dd className="mt-0.5 font-semibold text-ink-900">
                  {truck.transmission || "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-5 space-y-3">
              {sold ? (
                <div className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-600">
                  This truck has been sold. Message us on WhatsApp and we will
                  share similar vehicles in stock.
                </div>
              ) : (
                <WhatsAppBuyButton
                  truckId={truck.id}
                  href={whatsappLink}
                  size="lg"
                />
              )}

              <p className="text-center text-xs text-ink-400">
                Chat opens with the truck name, price and link already filled
                in.
              </p>
            </div>

            {truck.location ? (
              <p className="mt-5 border-t border-ink-100 pt-4 text-sm text-ink-600">
                <span className="font-medium text-ink-900">Located in:</span>{" "}
                {truck.location}
              </p>
            ) : null}
          </div>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight text-ink-950">
            Similar trucks
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((other) => (
              <TruckCard key={other.id} truck={other} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function specRows(truck: {
  make: string;
  model: string;
  year: number | null;
  mileageKm: number | null;
  fuelType: string;
  transmission: string;
  ownership: string;
  bodyType: string;
  capacityTons: number | null;
  location: string;
}) {
  return [
    { label: "Make", value: truck.make || "—" },
    { label: "Model", value: truck.model || "—" },
    { label: "Year", value: truck.year ? String(truck.year) : "—" },
    { label: "Mileage", value: formatKm(truck.mileageKm) },
    { label: "Fuel type", value: truck.fuelType || "—" },
    { label: "Transmission", value: truck.transmission || "—" },
    { label: "Ownership", value: truck.ownership || "—" },
    { label: "Body type", value: truck.bodyType || "—" },
    { label: "Payload", value: formatTons(truck.capacityTons) },
    { label: "Location", value: truck.location || "—" },
  ];
}

function DetailSkeleton() {
  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
      <div className="aspect-[4/3] animate-pulse rounded-xl bg-ink-200/70" />
      <div className="h-64 animate-pulse rounded-xl bg-ink-200/70" />
    </div>
  );
}

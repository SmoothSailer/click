import Link from "next/link";

import { TruckRowActions } from "@/components/admin/truck-row-actions";
import { formatKm, formatPrice } from "@/lib/format";
import { listAllTrucks, listInquiries } from "@/lib/trucks";
import type { TruckStatus } from "@/lib/types";

export default async function AdminDashboard() {
  const [trucks, inquiries] = await Promise.all([
    listAllTrucks(),
    listInquiries(500),
  ]);

  const available = trucks.filter((truck) => truck.status === "available").length;
  const sold = trucks.filter((truck) => truck.status === "sold").length;
  const reserved = trucks.filter((truck) => truck.status === "reserved").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-950">
            Trucks
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Everything you have listed, including sold vehicles.
          </p>
        </div>
        <Link
          href="/admin/trucks/new"
          className="rounded-lg bg-ink-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ink-800"
        >
          Add truck
        </Link>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Total listings" value={trucks.length} />
        <Stat label="Available" value={available} />
        <Stat label="Reserved" value={reserved} />
        <Stat label="Sold" value={sold} />
        <Stat
          label="WhatsApp inquiries"
          value={inquiries.length}
          href="/admin/inquiries"
        />
      </dl>

      <div className="mt-8 overflow-hidden rounded-xl border border-ink-200 bg-white">
        {trucks.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-ink-900">
              No trucks listed yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
              Add your first truck with photos and a price, and it shows up on
              the storefront straight away.
            </p>
            <Link
              href="/admin/trucks/new"
              className="mt-6 inline-flex rounded-lg bg-ink-950 px-4 py-2 text-sm font-semibold text-white"
            >
              Add truck
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-200 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Truck</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                  Price
                </th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">
                  Mileage
                </th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {trucks.map((truck) => (
                <tr key={truck.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                        {truck.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element -- pre-resized thumbnails served from local disk
                          <img
                            src={truck.images[0].thumb}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/trucks/${truck.id}`}
                          className="block truncate font-medium text-ink-900 hover:underline"
                        >
                          {truck.title}
                        </Link>
                        <p className="truncate text-xs text-ink-500">
                          {truck.make || truck.bodyType || "Truck"}
                          {truck.year ? ` · ${truck.year}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 font-medium text-ink-900 sm:table-cell">
                    {formatPrice(truck.price, truck.currency)}
                  </td>
                  <td className="hidden px-4 py-3 text-ink-600 md:table-cell">
                    {formatKm(truck.mileageKm)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={truck.status} />
                  </td>
                  <td className="px-4 py-3">
                    <TruckRowActions id={truck.id} status={truck.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const body = (
    <>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-bold text-ink-950">{value}</dd>
    </>
  );

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      {href ? (
        <Link href={href} className="block transition hover:opacity-80">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}

function StatusPill({ status }: { status: TruckStatus }) {
  const styles: Record<TruckStatus, string> = {
    available: "bg-emerald-100 text-emerald-800",
    reserved: "bg-accent-100 text-accent-700",
    sold: "bg-ink-100 text-ink-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

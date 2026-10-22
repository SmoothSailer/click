import Link from "next/link";

import { formatDateTime, formatPrice } from "@/lib/format";
import { listInquiries } from "@/lib/trucks";

export default async function InquiriesPage() {
  const inquiries = await listInquiries(500);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink-950">
        WhatsApp inquiries
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Every time a buyer taps the buy button on a listing, it shows up here.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-ink-200 bg-white">
        {inquiries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-ink-900">
              No inquiries yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
              Share your storefront link and inquiries will land here as
              buyers get in touch.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-200 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Truck</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                  Price
                </th>
                <th className="px-4 py-3 font-semibold">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td className="px-4 py-3">
                    {inquiry.truckId ? (
                      <Link
                        href={`/admin/trucks/${inquiry.truckId}`}
                        className="font-medium text-ink-900 hover:underline"
                      >
                        {inquiry.truckTitle || "Listing"}
                      </Link>
                    ) : (
                      <span className="font-medium text-ink-900">
                        {inquiry.truckTitle || "Listing"}
                      </span>
                    )}
                    <p className="text-xs text-ink-500">
                      via {inquiry.source}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-600 sm:table-cell">
                    {inquiry.truckPrice !== null
                      ? formatPrice(inquiry.truckPrice)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {formatDateTime(inquiry.createdAt)}
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

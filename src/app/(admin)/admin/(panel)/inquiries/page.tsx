import Link from "next/link";

import { formatDateTime, formatPrice } from "@/lib/format";
import { listInquiries } from "@/lib/trucks";
import type { Inquiry } from "@/lib/types";

export default async function InquiriesPage() {
  const inquiries = await listInquiries(500);

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
        WhatsApp inquiries
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Every time a buyer taps the buy button on a listing, it shows up here.
      </p>

      <div className="mt-5 overflow-hidden rounded-xl border border-ink-200 bg-white sm:mt-6">
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
          <>
            <ul className="divide-y divide-ink-100 sm:hidden">
              {inquiries.map((inquiry) => (
                <li key={inquiry.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <InquiryTitle inquiry={inquiry} />
                      <p className="text-xs text-ink-500">
                        via {inquiry.source}
                      </p>
                    </div>
                    {inquiry.truckPrice !== null ? (
                      <span className="shrink-0 text-sm font-semibold text-ink-900">
                        {formatPrice(inquiry.truckPrice)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-xs text-ink-500">
                    {formatDateTime(inquiry.createdAt)}
                  </p>
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left text-sm sm:table">
              <thead className="border-b border-ink-200 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Truck</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td className="px-4 py-3">
                      <InquiryTitle inquiry={inquiry} />
                      <p className="text-xs text-ink-500">
                        via {inquiry.source}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-ink-600">
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
          </>
        )}
      </div>
    </div>
  );
}

function InquiryTitle({ inquiry }: { inquiry: Inquiry }) {
  if (inquiry.truckId) {
    return (
      <Link
        href={`/admin/trucks/${inquiry.truckId}`}
        className="font-medium text-ink-900 hover:underline"
      >
        {inquiry.truckTitle || "Listing"}
      </Link>
    );
  }

  return (
    <span className="font-medium text-ink-900">
      {inquiry.truckTitle || "Listing"}
    </span>
  );
}

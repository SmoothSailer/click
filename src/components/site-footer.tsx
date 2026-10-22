import Link from "next/link";
import { cacheLife } from "next/cache";

import { SITE_NAME } from "@/lib/env";
import { generalWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";
import { Logo } from "./logo";

/** Cached so the year can be prerendered without tripping the prerender checks. */
async function currentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const whatsapp = generalWhatsAppLink();
  const year = await currentYear();

  return (
    <footer id="contact" className="mt-16 border-t border-ink-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Link href="/" className="inline-flex">
            <Logo markClassName="size-8" />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-500">
            Working trucks, tippers and pickups inspected and ready for the
            road. Inspect the photos, then close the deal on WhatsApp.
          </p>
        </div>

        <div className="text-sm">
          <h2 className="font-semibold text-ink-900">Browse</h2>
          <ul className="mt-3 space-y-2 text-ink-500">
            <li>
              <Link href="/#trucks" className="transition hover:text-ink-900">
                All trucks
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="transition hover:text-ink-900">
                How buying works
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h2 className="font-semibold text-ink-900">Get in touch</h2>
          <ul className="mt-3 space-y-2 text-ink-500">
            {whatsapp ? (
              <li>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-ink-900"
                >
                  <WhatsAppIcon className="size-4 text-emerald-600" />
                  Message us on WhatsApp
                </a>
              </li>
            ) : (
              <li>WhatsApp number not configured yet</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-100 py-5 text-center text-xs text-ink-400">
        © {year} {SITE_NAME}. All prices are indicative and
        subject to inspection.
      </div>
    </footer>
  );
}

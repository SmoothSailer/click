import Link from "next/link";

import { generalWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";
import { Logo } from "./logo";

export function SiteHeader() {
  const whatsapp = generalWhatsAppLink();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-600 md:flex">
          <Link href="/#trucks" className="transition hover:text-ink-950">
            Browse trucks
          </Link>
          <Link href="/#how-it-works" className="transition hover:text-ink-950">
            How it works
          </Link>
          <Link href="/#contact" className="transition hover:text-ink-950">
            Contact
          </Link>
        </nav>

        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <WhatsAppIcon className="size-4" />
            <span className="hidden sm:inline">Chat with us</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        ) : (
          <span className="rounded-lg border border-ink-200 px-3.5 py-2 text-xs font-medium text-ink-500">
            WhatsApp not configured
          </span>
        )}
      </div>
    </header>
  );
}

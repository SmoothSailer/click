import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { logoutAction } from "@/app/(admin)/admin/actions";
import { LogOutIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { requireAdmin } from "@/lib/auth";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <PanelShell>{children}</PanelShell>
    </Suspense>
  );
}

async function PanelShell({ children }: { children: ReactNode }) {
  // Re-checks the session on the server. The proxy already redirects
  // unauthenticated visitors, this is the second line of defence.
  await requireAdmin();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-3 sm:px-4 md:h-16 md:flex-nowrap md:py-0">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm font-bold text-ink-950 sm:text-base"
          >
            <LogoMark className="size-8" />
            <span>
              ClickEnergy{" "}
              <span className="hidden text-ink-500 sm:inline">Admin</span>
            </span>
          </Link>

          <nav className="order-3 flex w-full items-center gap-4 overflow-x-auto border-t border-ink-100 pt-2 text-sm font-medium text-ink-600 md:order-none md:w-auto md:border-0 md:pt-0">
            <Link href="/admin" className="transition hover:text-ink-950">
              Trucks
            </Link>
            <Link href="/admin/inquiries" className="transition hover:text-ink-950">
              Inquiries
            </Link>
            <Link href="/" className="transition hover:text-ink-950">
              View site
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/trucks/new"
              className="inline-flex min-h-10 items-center rounded-lg bg-ink-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-ink-800"
            >
              Add truck
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sign out"
                title="Sign out"
                className="inline-flex min-h-10 items-center rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                <LogOutIcon className="size-4 md:hidden" />
                <span className="hidden md:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-5 sm:px-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="h-28 border-b border-ink-200 bg-white md:h-16" />
      <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-5 sm:px-4 sm:py-8">
        <div className="h-8 w-40 animate-pulse rounded bg-ink-200" />
        <div className="mt-6 h-72 animate-pulse rounded-xl bg-ink-200/70" />
      </div>
    </div>
  );
}

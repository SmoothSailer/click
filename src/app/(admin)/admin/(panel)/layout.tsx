import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { logoutAction } from "@/app/(admin)/admin/actions";
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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-bold text-ink-950"
          >
            <LogoMark className="size-8" />
            <span>
              ClickEnergy <span className="text-ink-500">Admin</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-600 md:flex">
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

          <div className="flex items-center gap-3">
            <Link
              href="/admin/trucks/new"
              className="rounded-lg bg-ink-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-ink-800"
            >
              Add truck
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="h-16 border-b border-ink-200 bg-white" />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="h-8 w-40 animate-pulse rounded bg-ink-200" />
        <div className="mt-6 h-72 animate-pulse rounded-xl bg-ink-200/70" />
      </div>
    </div>
  );
}

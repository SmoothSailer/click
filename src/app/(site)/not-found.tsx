import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-700">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
        We could not find that listing
      </h1>
      <p className="mt-3 text-sm text-ink-500">
        The truck may have been sold or removed. Have a look at what is in
        stock right now.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-lg bg-ink-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800"
      >
        Browse available trucks
      </Link>
    </div>
  );
}

import "server-only";

import { cacheLife } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE, verifySessionToken } from "./session";

/**
 * True when the current request carries a valid admin session cookie.
 *
 * Marked `use cache: private` so it can read cookies while staying a
 * request-time check: the result is never shared between visitors and the
 * admin panel is never prerendered with someone else's session.
 */
export async function isAdmin(): Promise<boolean> {
  "use cache: private";
  cacheLife({ stale: 0, revalidate: 60, expire: 3600 });

  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

/** Redirects to the login page unless the request is authenticated. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}

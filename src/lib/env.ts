/**
 * Public (browser-visible) configuration.
 *
 * Only literal `process.env.NEXT_PUBLIC_*` member accesses are inlined into
 * the client bundle by Next.js, so these constants must be written out in
 * full here rather than looked up dynamically.
 */

export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "TruckMart";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(
  /\/+$/,
  "",
);

export const SITE_TAGLINE =
  process.env.NEXT_PUBLIC_SITE_TAGLINE?.trim() ||
  "Handpicked trucks, ready to earn. Browse, inspect, and buy on WhatsApp.";

/** WhatsApp number in international format, digits only (e.g. 919876543210). */
export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY?.trim() || "INR";

/**
 * Number grouping locale. Indian rupees group as 24,50,000 while most other
 * currencies group as 24,500,000, so the locale follows the currency unless
 * NEXT_PUBLIC_LOCALE says otherwise.
 */
export const LOCALE =
  process.env.NEXT_PUBLIC_LOCALE?.trim() ||
  (CURRENCY === "INR" ? "en-IN" : CURRENCY === "KSH" ? "en-KE" : "en-US");

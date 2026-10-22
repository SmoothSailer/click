import { CURRENCY, LOCALE } from "./env";

export function formatPrice(
  value: number,
  currency: string = CURRENCY,
): string {
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString(LOCALE)}`;
  }
}

export function formatKm(value: number | null): string {
  if (value === null) return "—";
  return `${value.toLocaleString("en-IN")} km`;
}

export function formatTons(value: number | null): string {
  if (value === null) return "—";
  return `${value} tonne${value === 1 ? "" : "s"}`;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

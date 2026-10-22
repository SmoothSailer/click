import type { TruckFilters } from "./types";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function positiveNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
}

/** Turns raw URL search params into the filter shape used by the data layer. */
export function parseFilters(params: RawSearchParams): TruckFilters {
  const filters: TruckFilters = {};

  const q = first(params.q)?.trim();
  if (q) filters.q = q;

  const make = first(params.make)?.trim();
  if (make) filters.make = make;

  const bodyType = first(params.body)?.trim();
  if (bodyType) filters.bodyType = bodyType;

  const year = positiveNumber(first(params.year));
  if (year !== undefined) filters.year = year;

  const minPrice = positiveNumber(first(params.min));
  if (minPrice !== undefined) filters.minPrice = minPrice;

  const maxPrice = positiveNumber(first(params.max));
  if (maxPrice !== undefined) filters.maxPrice = maxPrice;

  const sort = first(params.sort);
  if (
    sort === "newest" ||
    sort === "price_asc" ||
    sort === "price_desc" ||
    sort === "year_desc"
  ) {
    filters.sort = sort;
  }

  return filters;
}

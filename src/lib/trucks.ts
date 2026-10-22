import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { getSupabase } from "./supabase";
import { CURRENCY } from "./env";
import type {
  FilterOptions,
  Inquiry,
  InquiryRow,
  Truck,
  TruckFilters,
  TruckImage,
  TruckRow,
  TruckStatus,
} from "./types";

/** Every cached catalogue read carries this tag so admin edits can expire it. */
export const CATALOG_TAG = "catalog";
export const INQUIRY_TAG = "inquiries";

const STATUSES: TruckStatus[] = ["available", "reserved", "sold"];

// ---------------------------------------------------------------------------
// Row mapping
// ---------------------------------------------------------------------------

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toImages(value: unknown): TruckImage[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (typeof entry === "string") {
      return [{ src: entry, thumb: entry }];
    }
    if (entry && typeof entry === "object" && "src" in entry) {
      const image = entry as Partial<TruckImage>;
      if (typeof image.src !== "string") return [];
      return [{ src: image.src, thumb: image.thumb ?? image.src }];
    }
    return [];
  });
}

export function mapTruck(row: TruckRow): Truck {
  const status = STATUSES.includes(row.status as TruckStatus)
    ? (row.status as TruckStatus)
    : "available";

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    make: row.make ?? "",
    model: row.model ?? "",
    year: toNumber(row.year),
    price: toNumber(row.price) ?? 0,
    currency: row.currency ?? CURRENCY,
    mileageKm: toNumber(row.mileage_km),
    fuelType: row.fuel_type ?? "",
    transmission: row.transmission ?? "",
    ownership: row.ownership ?? "",
    bodyType: row.body_type ?? "",
    capacityTons: toNumber(row.capacity_tons),
    location: row.location ?? "",
    description: row.description ?? "",
    images: toImages(row.images),
    status,
    featured: Boolean(row.featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    truckId: row.truck_id,
    truckTitle: row.truck_title ?? "",
    truckPrice: toNumber(row.truck_price),
    source: row.source ?? "whatsapp",
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Reads (cached)
// ---------------------------------------------------------------------------

/** Runs the query for the catalogue. `status` of "any" ignores availability. */
async function fetchTrucks(
  filters: TruckFilters,
  status: TruckStatus | "any",
): Promise<TruckRow[]> {
  let query = getSupabase().from("trucks").select("*");

  if (status !== "any") {
    query = query.eq("status", status);
  }

  if (filters.q) {
    // Strip characters that would break the PostgREST `or` filter syntax.
    const term = filters.q.replace(/[,()%*]/g, " ").trim();
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,make.ilike.%${term}%,model.ilike.%${term}%,body_type.ilike.%${term}%`,
      );
    }
  }

  if (filters.make) query = query.eq("make", filters.make);
  if (filters.bodyType) query = query.eq("body_type", filters.bodyType);
  if (typeof filters.minPrice === "number") {
    query = query.gte("price", filters.minPrice);
  }
  if (typeof filters.maxPrice === "number") {
    query = query.lte("price", filters.maxPrice);
  }
  if (typeof filters.year === "number") query = query.eq("year", filters.year);

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "year_desc":
      query = query.order("year", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to load trucks: ${error.message}`);
  return (data ?? []) as TruckRow[];
}

/** Public catalogue: only trucks that are available for sale. */
export async function listPublicTrucks(
  filters: TruckFilters = {},
): Promise<Truck[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  return (await fetchTrucks(filters, "available")).map(mapTruck);
}

/**
 * Admin listing: every truck regardless of status.
 *
 * Deliberately not cached: the panel must always show what is in the
 * database right now, and the build should not depend on a live database.
 */
export async function listAllTrucks(): Promise<Truck[]> {
  return (await fetchTrucks({}, "any")).map(mapTruck);
}

export async function getTruckBySlug(slug: string): Promise<Truck | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  const { data, error } = await getSupabase()
    .from("trucks")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load truck: ${error.message}`);
  return data ? mapTruck(data as TruckRow) : null;
}

export async function getTruckById(id: string): Promise<Truck | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  const { data, error } = await getSupabase()
    .from("trucks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load truck: ${error.message}`);
  return data ? mapTruck(data as TruckRow) : null;
}

export async function getFilterOptions(): Promise<FilterOptions> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const { data, error } = await getSupabase()
    .from("trucks")
    .select("make, body_type, year, price")
    .eq("status", "available");

  if (error) throw new Error(`Failed to load filter options: ${error.message}`);

  const rows = (data ?? []) as Pick<
    TruckRow,
    "make" | "body_type" | "year" | "price"
  >[];

  const makes = new Set<string>();
  const bodyTypes = new Set<string>();
  const years = new Set<number>();
  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = 0;

  for (const row of rows) {
    if (row.make) makes.add(row.make);
    if (row.body_type) bodyTypes.add(row.body_type);
    const year = toNumber(row.year);
    if (year) years.add(year);
    const price = toNumber(row.price);
    if (price !== null) {
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);
    }
  }

  return {
    makes: [...makes].sort((a, b) => a.localeCompare(b)),
    bodyTypes: [...bodyTypes].sort((a, b) => a.localeCompare(b)),
    years: [...years].sort((a, b) => b - a),
    minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    maxPrice,
  };
}

/** Recent WhatsApp inquiries. Uncached so the panel is always up to date. */
export async function listInquiries(limit = 100): Promise<Inquiry[]> {
  const { data, error } = await getSupabase()
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load inquiries: ${error.message}`);
  return (data as InquiryRow[]).map(mapInquiry);
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export type TruckInput = {
  slug: string;
  title: string;
  make: string;
  model: string;
  year: number | null;
  price: number;
  currency: string;
  mileageKm: number | null;
  fuelType: string;
  transmission: string;
  ownership: string;
  bodyType: string;
  capacityTons: number | null;
  location: string;
  description: string;
  images: TruckImage[];
  status: TruckStatus;
  featured: boolean;
};

/** Maps the camelCase input onto the snake_case database columns. */
function toRow(input: TruckInput) {
  return {
    slug: input.slug,
    title: input.title,
    make: input.make,
    model: input.model,
    year: input.year,
    price: input.price,
    currency: input.currency,
    mileage_km: input.mileageKm,
    fuel_type: input.fuelType,
    transmission: input.transmission,
    ownership: input.ownership,
    body_type: input.bodyType,
    capacity_tons: input.capacityTons,
    location: input.location,
    description: input.description,
    images: input.images,
    status: input.status,
    featured: input.featured,
  };
}

export async function insertTruck(input: TruckInput): Promise<string> {
  const { data, error } = await getSupabase()
    .from("trucks")
    .insert(toRow(input))
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create truck: ${error.message}`);
  return (data as { id: string }).id;
}

export async function updateTruck(
  id: string,
  input: TruckInput,
): Promise<void> {
  const { error } = await getSupabase()
    .from("trucks")
    .update(toRow(input))
    .eq("id", id);

  if (error) throw new Error(`Failed to update truck: ${error.message}`);
}

export async function deleteTruck(id: string): Promise<void> {
  const { error } = await getSupabase().from("trucks").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete truck: ${error.message}`);
}

export async function setTruckStatus(
  id: string,
  status: TruckStatus,
): Promise<void> {
  const { error } = await getSupabase()
    .from("trucks")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(`Failed to update status: ${error.message}`);
}

export async function recordInquiry(input: {
  truckId: string | null;
  truckTitle: string;
  truckPrice: number | null;
  source?: string;
}): Promise<void> {
  const { error } = await getSupabase().from("inquiries").insert({
    truck_id: input.truckId,
    truck_title: input.truckTitle,
    truck_price: input.truckPrice,
    source: input.source ?? "whatsapp",
  });

  if (error) {
    // Logging an inquiry must never break the buyer's journey.
    console.error("Failed to record inquiry:", error.message);
  }
}

/** True when a slug is already taken by another truck. */
export async function slugExists(
  slug: string,
  exceptId?: string,
): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("trucks")
    .select("id")
    .eq("slug", slug)
    .limit(1);

  if (error) throw new Error(`Failed to check slug: ${error.message}`);

  const rows = (data ?? []) as { id: string }[];
  if (rows.length === 0) return false;
  if (!exceptId) return true;
  return rows.some((row) => row.id !== exceptId);
}

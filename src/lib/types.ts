export type TruckStatus = "available" | "reserved" | "sold";

export type TruckImage = {
  /** Full size image, served from /api/media. */
  src: string;
  /** Small square thumbnail, served from /api/media. */
  thumb: string;
};

export type Truck = {
  id: string;
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
  createdAt: string;
  updatedAt: string;
};

/** Row shape as returned by PostgREST (snake_case columns). */
export type TruckRow = {
  id: string;
  slug: string;
  title: string;
  make: string | null;
  model: string | null;
  year: number | null;
  price: number | string | null;
  currency: string | null;
  mileage_km: number | null;
  fuel_type: string | null;
  transmission: string | null;
  ownership: string | null;
  body_type: string | null;
  capacity_tons: number | string | null;
  location: string | null;
  description: string | null;
  images: unknown;
  status: string | null;
  featured: boolean | null;
  created_at: string;
  updated_at: string;
};

export type Inquiry = {
  id: string;
  truckId: string | null;
  truckTitle: string;
  truckPrice: number | null;
  source: string;
  createdAt: string;
};

export type InquiryRow = {
  id: string;
  truck_id: string | null;
  truck_title: string | null;
  truck_price: number | string | null;
  source: string | null;
  created_at: string;
};

export type TruckFilters = {
  q?: string;
  make?: string;
  bodyType?: string;
  minPrice?: number;
  maxPrice?: number;
  year?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "year_desc";
};

export type FilterOptions = {
  makes: string[];
  bodyTypes: string[];
  years: number[];
  minPrice: number;
  maxPrice: number;
};

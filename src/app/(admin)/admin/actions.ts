"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { CURRENCY } from "@/lib/env";
import {
  ADMIN_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifyPassword,
} from "@/lib/session";
import { slugify } from "@/lib/slug";
import { deleteMediaFiles } from "@/lib/storage";
import {
  CATALOG_TAG,
  deleteTruck,
  getTruckById,
  insertTruck,
  setTruckStatus,
  slugExists,
  updateTruck,
  type TruckInput,
} from "@/lib/trucks";
import type { TruckStatus } from "@/lib/types";
import {
  fieldErrors,
  imagesSchema,
  loginSchema,
  truckFormSchema,
} from "@/lib/validation";

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ password: formData.get("password") });

  if (!parsed.success) {
    return { error: "Enter the admin password." };
  }

  if (!process.env.ADMIN_PASSWORD) {
    return {
      error:
        "Admin access is not configured yet. Set ADMIN_PASSWORD in .env.local and restart the server.",
    };
  }

  if (!verifyPassword(parsed.data.password)) {
    return { error: "That password is not correct." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Trucks
// ---------------------------------------------------------------------------

export type TruckFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function buildSlug(
  title: string,
  requested: string,
  exceptId?: string,
): Promise<string> {
  const base = slugify(requested || title) || "truck";

  let candidate = base;
  let counter = 2;
  while (await slugExists(candidate, exceptId)) {
    candidate = `${base}-${counter}`;
    counter += 1;
    if (counter > 50) {
      candidate = `${base}-${counter}-${Date.now()}`;
      break;
    }
  }

  return candidate;
}

export async function saveTruckAction(
  _prevState: TruckFormState,
  formData: FormData,
): Promise<TruckFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const raw = Object.fromEntries(formData.entries());

  const parsed = truckFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const values = parsed.data;

  let images: TruckInput["images"] = [];
  try {
    const imagesParsed = imagesSchema.safeParse(
      JSON.parse(values.images || "[]"),
    );
    if (!imagesParsed.success) {
      return {
        error:
          "One of the photos could not be read. Remove it and upload it again.",
      };
    }
    images = imagesParsed.data;
  } catch {
    return { error: "The photo list could not be read. Please try again." };
  }

  const slug = await buildSlug(
    values.title,
    values.slug,
    id || undefined,
  );

  const input: TruckInput = {
    slug,
    title: values.title,
    make: values.make,
    model: values.model,
    year: values.year ?? null,
    price: values.price,
    currency: CURRENCY,
    mileageKm: values.mileageKm ?? null,
    fuelType: values.fuelType,
    transmission: values.transmission,
    ownership: values.ownership,
    bodyType: values.bodyType,
    capacityTons: values.capacityTons ?? null,
    location: values.location,
    description: values.description,
    images,
    status: values.status,
    featured: values.featured,
  };

  if (id) {
    const existing = await getTruckById(id);
    if (!existing) {
      return { error: "That truck no longer exists." };
    }

    await updateTruck(id, input);

    const kept = new Set(images.flatMap((image) => [image.src, image.thumb]));
    const removed = existing.images
      .flatMap((image) => [image.src, image.thumb])
      .filter((path) => !kept.has(path));
    await deleteMediaFiles(removed);
  } else {
    await insertTruck(input);
  }

  updateTag(CATALOG_TAG);
  revalidatePath("/");
  revalidatePath("/trucks/[slug]", "page");

  redirect("/admin");
}

export async function deleteTruckAction(id: string): Promise<void> {
  await requireAdmin();

  const truck = await getTruckById(id);
  if (!truck) return;

  await deleteTruck(id);
  await deleteMediaFiles(
    truck.images.flatMap((image) => [image.src, image.thumb]),
  );

  updateTag(CATALOG_TAG);
  revalidatePath("/");
}

export async function setTruckStatusAction(
  id: string,
  status: TruckStatus,
): Promise<void> {
  await requireAdmin();

  await setTruckStatus(id, status);

  updateTag(CATALOG_TAG);
  revalidatePath("/");
}

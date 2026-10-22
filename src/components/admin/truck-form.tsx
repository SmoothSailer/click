"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { saveTruckAction } from "@/app/(admin)/admin/actions";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
} from "@/lib/styles";
import { slugify } from "@/lib/slug";
import type { Truck, TruckImage } from "@/lib/types";
import { SpinnerIcon } from "@/components/icons";
import { ImageUploader } from "./image-uploader";

const FUEL_TYPES = ["Diesel", "Petrol", "CNG", "Electric"];
const TRANSMISSIONS = ["Manual", "Automatic"];
const OWNERSHIPS = ["First", "Second", "Third"];
const BODY_TYPES = [
  "Truck",
  "SFC Light Truck",
  "Tipper",
  "Pickup",
  "Container",
  "Trailer",
  "Tanker",
  "Mini Truck",
];

export function TruckForm({ truck }: { truck?: Truck }) {
  const [state, formAction, pending] = useActionState(saveTruckAction, {});
  const [images, setImages] = useState<TruckImage[]>(truck?.images ?? []);

  const [title, setTitle] = useState(truck?.title ?? "");
  const [slug, setSlug] = useState(truck?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(truck));

  const errors = state.fieldErrors ?? {};

  function handleTitle(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={truck?.id ?? ""} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <section className="rounded-xl border border-ink-200 bg-white p-4 sm:p-5">
        <h2 className="text-base font-semibold text-ink-950 sm:text-lg">Basics</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelClass}>
              Listing title *
            </label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(event) => handleTitle(event.target.value)}
              placeholder="Tata 407 Gold SFC 2.0T - 2019"
              className={inputClass}
              required
            />
            {errors.title ? (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="slug" className={labelClass}>
              URL slug
            </label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="tata-407-gold-sfc"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-ink-400">
              Leave as is to generate it from the title. Changing it breaks
              existing links to this listing.
            </p>
          </div>

          <div>
            <label htmlFor="make" className={labelClass}>
              Make
            </label>
            <input
              id="make"
              name="make"
              defaultValue={truck?.make ?? ""}
              placeholder="Tata"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="model" className={labelClass}>
              Model
            </label>
            <input
              id="model"
              name="model"
              defaultValue={truck?.model ?? ""}
              placeholder="407 Gold SFC"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="year" className={labelClass}>
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              min={1980}
              max={2100}
              defaultValue={truck?.year ?? ""}
              placeholder="2019"
              className={inputClass}
            />
            {errors.year ? (
              <p className="mt-1 text-xs text-red-600">{errors.year}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="price" className={labelClass}>
              Price *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step={1000}
              inputMode="numeric"
              defaultValue={truck?.price ?? ""}
              placeholder="850000"
              className={inputClass}
              required
            />
            {errors.price ? (
              <p className="mt-1 text-xs text-red-600">{errors.price}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="mileageKm" className={labelClass}>
              Mileage (km)
            </label>
            <input
              id="mileageKm"
              name="mileageKm"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={truck?.mileageKm ?? ""}
              placeholder="142000"
              className={inputClass}
            />
            {errors.mileageKm ? (
              <p className="mt-1 text-xs text-red-600">{errors.mileageKm}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="capacityTons" className={labelClass}>
              Payload (tonnes)
            </label>
            <input
              id="capacityTons"
              name="capacityTons"
              type="number"
              min={0}
              step={0.5}
              defaultValue={truck?.capacityTons ?? ""}
              placeholder="2"
              className={inputClass}
            />
            {errors.capacityTons ? (
              <p className="mt-1 text-xs text-red-600">{errors.capacityTons}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-ink-200 bg-white p-4 sm:p-5">
        <h2 className="text-base font-semibold text-ink-950 sm:text-lg">Configuration</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div>
            <label htmlFor="fuelType" className={labelClass}>
              Fuel type
            </label>
            <input
              id="fuelType"
              name="fuelType"
              list="fuel-types"
              defaultValue={truck?.fuelType ?? "Diesel"}
              className={inputClass}
            />
            <datalist id="fuel-types">
              {FUEL_TYPES.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="transmission" className={labelClass}>
              Transmission
            </label>
            <input
              id="transmission"
              name="transmission"
              list="transmissions"
              defaultValue={truck?.transmission ?? "Manual"}
              className={inputClass}
            />
            <datalist id="transmissions">
              {TRANSMISSIONS.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="ownership" className={labelClass}>
              Ownership
            </label>
            <input
              id="ownership"
              name="ownership"
              list="ownerships"
              defaultValue={truck?.ownership ?? "First"}
              className={inputClass}
            />
            <datalist id="ownerships">
              {OWNERSHIPS.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="bodyType" className={labelClass}>
              Body type
            </label>
            <input
              id="bodyType"
              name="bodyType"
              list="body-types"
              defaultValue={truck?.bodyType ?? "Truck"}
              className={inputClass}
            />
            <datalist id="body-types">
              {BODY_TYPES.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="location" className={labelClass}>
              Location
            </label>
            <input
              id="location"
              name="location"
              defaultValue={truck?.location ?? ""}
              placeholder="Chennai, Tamil Nadu"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={truck?.description ?? ""}
              placeholder="Condition, service history, fitness, insurance, why it is being sold…"
              className={`${inputClass} min-h-32 resize-y`}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-ink-200 bg-white p-4 sm:p-5">
        <h2 className="text-base font-semibold text-ink-950 sm:text-lg">Photos</h2>
        <div className="mt-4">
          <ImageUploader images={images} onChange={setImages} />
        </div>
      </section>

      <section className="rounded-xl border border-ink-200 bg-white p-4 sm:p-5">
        <h2 className="text-base font-semibold text-ink-950 sm:text-lg">Visibility</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={truck?.status ?? "available"}
              className={inputClass}
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={truck?.featured ?? false}
                className="size-4 rounded border-ink-300 text-ink-950 focus:ring-ink-400"
              />
              Feature on the home page
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <FormActions pending={pending} cancelHref="/admin" />
        <Link
          href="/"
          className="text-center text-sm font-medium text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline sm:text-left"
        >
          View storefront
        </Link>
      </div>
    </form>
  );
}

function FormActions({
  pending,
  cancelHref,
}: {
  pending: boolean;
  cancelHref: string;
}) {
  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className={`${buttonPrimaryClass} w-full sm:w-auto`}
      >
        {pending ? <SpinnerIcon className="size-4" /> : null}
        {pending ? "Saving…" : "Save truck"}
      </button>
      <a href={cancelHref} className={`${buttonSecondaryClass} w-full sm:w-auto`}>
        Cancel
      </a>
    </>
  );
}

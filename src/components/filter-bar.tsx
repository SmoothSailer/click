import Link from "next/link";

import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from "@/lib/styles";
import type { FilterOptions, TruckFilters } from "@/lib/types";

export function FilterBar({
  options,
  filters,
}: {
  options: FilterOptions;
  filters: TruckFilters;
}) {
  const hasFilters =
    Boolean(filters.q) ||
    Boolean(filters.make) ||
    Boolean(filters.bodyType) ||
    typeof filters.year === "number" ||
    typeof filters.minPrice === "number" ||
    typeof filters.maxPrice === "number";

  return (
    <form
      action="/#trucks"
      method="get"
      className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="q" className={labelClass}>
            Search
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.q ?? ""}
            placeholder="Model, make or body type"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="make" className={labelClass}>
            Make
          </label>
          <select
            id="make"
            name="make"
            defaultValue={filters.make ?? ""}
            className={inputClass}
          >
            <option value="">All makes</option>
            {options.makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="body" className={labelClass}>
            Body type
          </label>
          <select
            id="body"
            name="body"
            defaultValue={filters.bodyType ?? ""}
            className={inputClass}
          >
            <option value="">All body types</option>
            {options.bodyTypes.map((bodyType) => (
              <option key={bodyType} value={bodyType}>
                {bodyType}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="year" className={labelClass}>
            Year
          </label>
          <select
            id="year"
            name="year"
            defaultValue={filters.year ? String(filters.year) : ""}
            className={inputClass}
          >
            <option value="">Any year</option>
            {options.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="min" className={labelClass}>
            Min price
          </label>
          <input
            id="min"
            name="min"
            type="number"
            min={0}
            step={1000}
            inputMode="numeric"
            defaultValue={filters.minPrice ?? ""}
            placeholder="0"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="max" className={labelClass}>
            Max price
          </label>
          <input
            id="max"
            name="max"
            type="number"
            min={0}
            step={1000}
            inputMode="numeric"
            defaultValue={filters.maxPrice ?? ""}
            placeholder={options.maxPrice ? String(options.maxPrice) : "Any"}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="sort" className={labelClass}>
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort ?? "newest"}
            className={inputClass}
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="year_desc">Year: newest first</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button type="submit" className={`${buttonPrimaryClass} flex-1`}>
            Apply filters
          </button>
          {hasFilters ? (
            <Link href="/#trucks" className={buttonSecondaryClass}>
              Clear
            </Link>
          ) : null}
        </div>
      </div>
    </form>
  );
}

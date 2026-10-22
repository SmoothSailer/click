import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

/** Empty strings become `undefined` so optional numbers stay optional. */
const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

const optionalInt = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ error: "Enter a whole number" }).int().optional(),
);

const optionalDecimal = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ error: "Enter a number" }).optional(),
);

const requiredNumber = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ error: "Enter a price" }).min(0, "Price cannot be negative"),
);

/** HTML checkboxes submit "on" when checked and nothing when unchecked. */
const checkbox = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

export const truckFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Enter a title of at least 3 characters")
    .max(120, "Keep the title under 120 characters"),
  slug: text(120).default(""),
  make: text(40).default(""),
  model: text(60).default(""),
  year: optionalInt,
  price: requiredNumber,
  mileageKm: optionalInt,
  fuelType: text(40).default("Diesel"),
  transmission: text(40).default("Manual"),
  ownership: text(40).default("First"),
  bodyType: text(40).default("Truck"),
  capacityTons: optionalDecimal,
  location: text(120).default(""),
  description: text(4000).default(""),
  status: z.enum(["available", "reserved", "sold"]).default("available"),
  featured: checkbox.default(false),
  images: z.string().default("[]"),
});

export type TruckFormValues = z.infer<typeof truckFormSchema>;

export const imagesSchema = z
  .array(
    z.object({
      src: z.string().regex(/^\/api\/media\/[0-9a-f-]{36}\.webp$/, "Bad image"),
      thumb: z
        .string()
        .regex(/^\/api\/media\/[0-9a-f-]{36}\.thumb\.webp$/, "Bad thumbnail"),
    }),
  )
  .max(12, "A truck can have at most 12 photos");

export const loginSchema = z.object({
  password: z.string().min(1, "Enter the admin password"),
});

/** Flattens a ZodError into `{ field: message }` for form rendering. */
export function fieldErrors(
  error: z.ZodError,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}

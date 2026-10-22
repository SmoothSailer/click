/**
 * Local demo database.
 *
 * Speaks just enough of the PostgREST API for the app to run without a
 * Supabase account: trucks and inquiries live in memory and reset when the
 * process restarts. Point NEXT_PUBLIC_SUPABASE_URL at it and start it with
 *   npm run db:mock
 *
 * This is a development convenience only. Real deployments must use Supabase.
 */
import http from "node:http";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const now = new Date().toISOString();

/**
 * Draws a simple placeholder "photo" so the gallery has something to show.
 * Written to the same folder the app serves uploads from.
 */
async function makePhoto(name, body, cab, sky) {
  const dir = path.join(process.cwd(), "storage", "uploads");
  await fs.mkdir(dir, { recursive: true });

  const full = path.join(dir, `${name}.webp`);
  const thumb = path.join(dir, `${name}.thumb.webp`);

  try {
    await fs.access(full);
    await fs.access(thumb);
    return;
  } catch {
    // not generated yet
  }

  const artwork = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${sky[0]}"/>
          <stop offset="100%" stop-color="${sky[1]}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#sky)"/>
      <rect y="640" width="1200" height="260" fill="#3b3f46"/>
      <rect y="628" width="1200" height="12" fill="#6b7280"/>
      <rect x="90" y="330" width="700" height="300" rx="10" fill="${body}"/>
      <rect x="790" y="400" width="260" height="230" rx="14" fill="${cab}"/>
      <rect x="835" y="440" width="170" height="110" rx="6" fill="#cfe3f7" opacity="0.85"/>
      <circle cx="260" cy="645" r="72" fill="#1b1f26"/>
      <circle cx="260" cy="645" r="32" fill="#59616e"/>
      <circle cx="640" cy="645" r="72" fill="#1b1f26"/>
      <circle cx="640" cy="645" r="32" fill="#59616e"/>
      <circle cx="920" cy="645" r="72" fill="#1b1f26"/>
      <circle cx="920" cy="645" r="32" fill="#59616e"/>
    </svg>`,
  );

  await sharp(artwork).webp({ quality: 85 }).toFile(full);
  await sharp(artwork)
    .resize(600, 450, { fit: "cover" })
    .webp({ quality: 75 })
    .toFile(thumb);
}

const PHOTO_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PHOTO_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

await makePhoto(PHOTO_A, "#c2410c", "#f97316", ["#fde68a", "#fb923c"]);
await makePhoto(PHOTO_B, "#0f766e", "#14b8a6", ["#bae6fd", "#7dd3fc"]);

const photo = (name) => [
  { src: `/api/media/${name}.webp`, thumb: `/api/media/${name}.thumb.webp` },
];

const trucks = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "tata-407-gold-sfc-2019",
    title: "Tata 407 Gold SFC 2.0T - 2019",
    make: "Tata",
    model: "407 Gold SFC",
    year: 2019,
    price: 850000,
    currency: "INR",
    mileage_km: 142000,
    fuel_type: "Diesel",
    transmission: "Manual",
    ownership: "First",
    body_type: "SFC Light Truck",
    capacity_tons: 2,
    location: "Chennai, Tamil Nadu",
    description:
      "Well maintained Tata 407 Gold SFC with a clean load body. All service records available, fitness renewed, insurance valid. Ideal for city distribution and FMCG loads.",
    images: photo(PHOTO_A),
    status: "available",
    featured: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "ashok-leyland-allysa-2020",
    title: "Ashok Leyland AlYSA 2116 HD - 2020",
    make: "Ashok Leyland",
    model: "AlYSA 2116 HD",
    year: 2020,
    price: 1450000,
    currency: "INR",
    mileage_km: 98000,
    fuel_type: "Diesel",
    transmission: "Manual",
    ownership: "First",
    body_type: "Tipper",
    capacity_tons: 6,
    location: "Coimbatore, Tamil Nadu",
    description:
      "Heavy duty tipper with reinforced body and hydraulic tipping arrangement. Tyres replaced recently, payload 6 tonnes, suited for construction material movement.",
    images: photo(PHOTO_B),
    status: "available",
    featured: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "eicher-pro-2049-tipper-2018",
    title: "Eicher Pro 2049 Tipper - 2018",
    make: "Eicher",
    model: "Pro 2049",
    year: 2018,
    price: 1250000,
    currency: "INR",
    mileage_km: 176500,
    fuel_type: "Diesel",
    transmission: "Manual",
    ownership: "Second",
    body_type: "Tipper",
    capacity_tons: 4.5,
    location: "Coimbatore, Tamil Nadu",
    description:
      "Reliable workhorse with a 4.5 tonne payload. Engine and gearbox in good working order, body recently repainted. Ready for immediate dispatch.",
    images: photo(PHOTO_B),
    status: "available",
    featured: false,
    created_at: now,
    updated_at: now,
  },
];

const inquiries = [];

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

function tableFor(pathname) {
  return pathname.split("/")[3] || "";
}

function applyFilters(rows, params) {
  let result = rows;
  for (const [key, value] of params) {
    if (key === "or") {
      // format: (title.ilike.*term*,make.ilike.*term*)
      const inner = value.replace(/^\(|\)$/g, "");
      const parts = inner.split(",").map((p) => p.trim());
      const clauses = parts.map((part) => {
        const [col, op, val] = part.split(".");
        const wanted = val.replace(/^[*%]|[*%]$/g, "").toLowerCase();
        return { col, op, wanted };
      });
      result = result.filter((row) =>
        clauses.some(
          (c) => String(row[c.col] ?? "").toLowerCase().includes(c.wanted),
        ),
      );
      continue;
    }
    if (key === "price" && value.startsWith("gte.")) {
      result = result.filter((r) => Number(r.price) >= Number(value.slice(4)));
      continue;
    }
    if (key === "price" && value.startsWith("lte.")) {
      result = result.filter((r) => Number(r.price) <= Number(value.slice(4)));
      continue;
    }
    if (key === "year" && value.startsWith("eq.")) {
      result = result.filter((r) => String(r.year) === value.slice(3));
      continue;
    }
    if (!value.startsWith("eq.")) continue;
    const wanted = value.slice(3);
    if (key === "status") result = result.filter((r) => r.status === wanted);
    else if (key === "slug") result = result.filter((r) => r.slug === wanted);
    else if (key === "id") result = result.filter((r) => r.id === wanted);
    else if (key === "make") result = result.filter((r) => r.make === wanted);
    else if (key === "body_type") result = result.filter((r) => r.body_type === wanted);
  }
  return result;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const wantsObject = (req.headers.accept || "").includes("vnd.pgrst.object");
  const body = await readBody(req);

  if (!url.pathname.startsWith("/rest/v1/")) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end("{}");
    return;
  }

  console.log("REQ", req.method, url.pathname, url.searchParams.toString());
  const table = tableFor(url.pathname);
  const rows = table === "trucks" ? trucks : inquiries;

  if (req.method === "GET") {
    const filtered = applyFilters(rows, url.searchParams);

    if (wantsObject) {
      if (filtered.length === 0) {
        res.writeHead(406, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            code: "PGRST116",
            details: "The result contains 0 rows",
            hint: null,
            message: "JSON object requested, multiple (or no) rows returned",
          }),
        );
        return;
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(filtered[0]));
      return;
    }

    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(filtered));
    return;
  }

  if (req.method === "POST") {
    const payload = JSON.parse(body || "{}");
    const row = {
      id: randomUUID(),
      created_at: now,
      updated_at: now,
      ...payload,
    };
    rows.push(row);
    res.writeHead(201, { "content-type": "application/json" });
    res.end(wantsObject ? JSON.stringify(row) : "");
    return;
  }

  if (req.method === "PATCH") {
    const payload = JSON.parse(body || "{}");
    const filtered = applyFilters(rows, url.searchParams);
    for (const row of filtered) Object.assign(row, payload, { updated_at: now });
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "DELETE") {
    const filtered = applyFilters(rows, url.searchParams);
    for (const row of filtered) rows.splice(rows.indexOf(row), 1);
    res.writeHead(204);
    res.end();
    return;
  }

  res.writeHead(405);
  res.end();
});

server.listen(54321, () => {
  console.log("mock supabase listening on http://127.0.0.1:54321");
});

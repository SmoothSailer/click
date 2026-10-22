# TruckMart — truck marketplace with WhatsApp checkout

A small storefront for selling trucks. The admin uploads photos and prices
from a private panel; visitors browse the catalogue and close the deal by
messaging the seller on WhatsApp.

- **Storefront** — searchable, filterable listing grid plus a detail page per truck.
- **Buy on WhatsApp** — every listing opens a `wa.me` chat with the truck
  name, price and link already filled in. Taps are logged so the seller can
  see which trucks are getting attention.
- **Admin panel** — password protected. Add, edit, feature, reserve, sell and
  delete trucks. Photos are uploaded from the browser and resized on the server.
- **Stack** — Next.js 16 (App Router, TypeScript, Tailwind v4), Supabase
  Postgres, local disk for images.

---

## 1. Requirements

- Node.js 20.9 or newer
- A Supabase project (free tier is fine)

## 2. Setup

```bash
npm install
cp .env.example .env.local     # then fill in the values
```

> **Values containing `#` must be quoted.** A `.env` line that starts with `#`
> is a comment, and an unquoted value is cut off at the first `#`. Use
> `ADMIN_PASSWORD="your#password"` and `AUTH_SECRET="your#secret"`.

### Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query** and paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql). Run it.
3. Optional: paste [`supabase/seed.sql`](supabase/seed.sql) too, for four
   sample listings.
4. Copy **Settings → API → Project URL** and **Service Role Key** into
   `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

The service role key stays on the server. The anon key is never sent to the
browser, and the RLS policies in `schema.sql` keep direct client access
limited to listings that are marked available.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side database key, never exposed |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `AUTH_SECRET` | Signs the admin session cookie (32+ random characters) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Business number, international format, digits only (`919876543210`) |
| `NEXT_PUBLIC_SITE_NAME` | Name shown in the header and page titles |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used in the WhatsApp message |
| `NEXT_PUBLIC_SITE_TAGLINE` | Tagline used in metadata |
| `NEXT_PUBLIC_CURRENCY` | Currency code, defaults to `INR` |
| `NEXT_PUBLIC_LOCALE` | Number grouping locale. `en-KE` gives 2,450,000, `en-IN` gives 24,50,000. Derived from the currency when unset |
| `UPLOAD_DIR` | Optional. Where photos are written. Defaults to `./storage/uploads` |

Generate `AUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Run it

```bash
npm run dev      # http://localhost:3001
```

Open `/admin` and sign in with `ADMIN_PASSWORD`.

> The app runs on **port 3001** (`dev` and `start` scripts) because port 3000
> is already taken on this machine. Change the `-p` flag in `package.json` if
> you prefer another port, and keep `NEXT_PUBLIC_SITE_URL` in step so the
> WhatsApp message links to the right address.

> The first `npm run build` reads the database to prerender the catalogue, so
> the Supabase variables have to be in place before you build.

### Running without a Supabase account

A small in-memory stand-in for Supabase ships with the project:

```bash
npm run db:mock   # terminal 1 — serves the PostgREST API on 127.0.0.1:54321
npm run dev       # terminal 2
```

Point `NEXT_PUBLIC_SUPABASE_URL` at `http://127.0.0.1:54321` and give
`SUPABASE_SERVICE_ROLE_KEY` any non-empty value. The mock resets whenever it
restarts, so it is only useful for looking around — use Supabase for real
data.

## 3. How it fits together

```
src/
  app/
    (site)/            public storefront
      page.tsx             listing + filters
      trucks/[slug]/       detail page with the WhatsApp buy button
    (admin)/admin/     admin panel
      login/                password sign in
      (panel)/             dashboard, add/edit, inquiries
    api/
      admin/upload/        photo upload (resizes to webp)
      media/[...path]/     serves uploaded photos
  actions.ts          public server action (logs a WhatsApp inquiry)
  components/         UI
  lib/                env, auth, data access, validation
  proxy.ts            redirects unauthenticated /admin requests to the login
supabase/
  schema.sql          tables, indexes, RLS policies
  seed.sql            sample listings
storage/uploads/      uploaded photos (git ignored)
```

**Caching.** The public catalogue is cached with the `catalog` tag, so pages
render as static HTML. Every admin save calls `updateTag("catalog")`, which
expires the cached listings so the storefront shows the change immediately.
The admin panel itself is never cached, so it always reflects the database.

**Photos.** Uploads go to `POST /api/admin/upload`, are re-encoded to webp
(1600px max for the full image, 600×450 for the thumbnail) and written to
`storage/uploads/`. `GET /api/media/<file>` serves them with immutable cache
headers. Removing a photo in the editor deletes the file from disk when you
save.

**Auth.** One shared admin password. Signing in sets an httpOnly cookie
containing an HMAC-signed expiry timestamp, valid for 8 hours. The proxy
redirects visitors without a valid cookie, and every server action re-checks
the session before touching the database.

## 4. Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## 5. Deploying

Upload the photos to a persistent volume and point `UPLOAD_DIR` at it — local
disk storage needs a disk that survives restarts.

```bash
npm ci
npm run build
npm start
```

Any Node host works (a VPS, Railway, Render, Fly.io, a Docker container).
Mount a volume at `UPLOAD_DIR` and set the environment variables from
`.env.example`. If you deploy to a platform with an ephemeral filesystem,
switch `src/lib/storage.ts` to object storage.

## 6. Notes

- `npm audit` reports advisories in `eslint-config-next`'s dependencies. They
  are dev-only; the suggested fix downgrades Next.js to 14, so it is not
  applied.
- The WhatsApp number must include the country code without `+` or spaces.
  Without it the buttons show a "not configured" message instead of a link.

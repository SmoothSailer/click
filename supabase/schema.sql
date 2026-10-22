-- Truck marketplace schema
-- Run this in the Supabase SQL editor (Dashboard -> SQL -> New query),
-- or with `psql "$SUPABASE_DB_URL" -f supabase/schema.sql`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- trucks
-- ---------------------------------------------------------------------------
create table if not exists public.trucks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  make text not null default '',
  model text not null default '',
  year integer,
  price numeric(14, 2) not null default 0,
  currency text not null default 'KSH',
  mileage_km integer,
  fuel_type text not null default 'Diesel',
  transmission text not null default 'Manual',
  ownership text not null default 'First',
  body_type text not null default 'Truck',
  capacity_tons numeric(8, 2),
  location text not null default '',
  description text not null default '',
  -- [{ "src": "/api/media/<id>.webp", "thumb": "/api/media/<id>.thumb.webp" }]
  images jsonb not null default '[]'::jsonb,
  status text not null default 'available'
    check (status in ('available', 'reserved', 'sold')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trucks_status_idx on public.trucks (status);
create index if not exists trucks_make_idx on public.trucks (make);
create index if not exists trucks_price_idx on public.trucks (price);
create index if not exists trucks_created_at_idx on public.trucks (created_at desc);
create index if not exists trucks_featured_idx on public.trucks (featured) where featured = true;

-- Keep the currency in step with NEXT_PUBLIC_CURRENCY in .env
alter table public.trucks alter column currency set default 'KSH';

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trucks_set_updated_at on public.trucks;
create trigger trucks_set_updated_at
  before update on public.trucks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- inquiries  (logged when a buyer hits the WhatsApp buy button)
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  truck_id uuid references public.trucks (id) on delete set null,
  truck_title text not null default '',
  truck_price numeric(14, 2),
  source text not null default 'whatsapp',
  created_at timestamptz not null default now()
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
--   * The website reads through the service role key on the server, so it
--     bypasses RLS and sees every truck regardless of status.
--   * If the anon key is ever used from a browser, it may only read
--     trucks that are marked available.
--   * Nobody can write from the client: all writes go through server
--     actions that use the service role key.
-- ---------------------------------------------------------------------------
alter table public.trucks enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "public read available trucks" on public.trucks;
create policy "public read available trucks"
  on public.trucks for select
  to anon, authenticated
  using (status = 'available');

drop policy if exists "no public access to inquiries" on public.inquiries;
create policy "no public access to inquiries"
  on public.inquiries for select
  to anon, authenticated
  using (false);

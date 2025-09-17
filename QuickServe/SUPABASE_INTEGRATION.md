Supabase Integration Guide

Overview
- This app now supports Supabase for auth and data. No localhost/server code is required at runtime.
- Configure public runtime keys in `config.js` and deploy as a static site to Vercel.

What You Need
- SUPABASE_URL: Your project URL (e.g., https://YOUR_REF.supabase.co)
- SUPABASE_ANON_KEY: Your anon public key
- Recommended tables with basic columns and RLS policies

Configure Frontend
- Edit `config.js` and set `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- `index.html` already loads the Supabase SDK CDN and the integration layer.

Minimal SQL Schema (run in Supabase SQL editor)
```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile (separate from auth.users)
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid references auth.users(id) on delete set null,
  email text unique,
  phone text,
  name text,
  role text check (role in ('admin','provider','customer')) default 'customer',
  status text default 'active',
  verified boolean default false,
  created_at timestamp with time zone default now()
);

-- Services catalog
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  title text not null,
  description text not null,
  price integer not null default 0,
  duration text,
  duration_text text,
  area text,
  provider text,
  provider_id uuid references public.users(id) on delete set null,
  status text default 'approved',
  rating numeric(3,2) default 0,
  reviews integer default 0,
  images jsonb,
  online_payment boolean default true,
  verified boolean default false,
  available boolean default true,
  created_at timestamp with time zone default now()
);

-- Bookings
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid references public.services(id) on delete cascade,
  provider_id uuid references public.users(id) on delete set null,
  customer_id uuid references public.users(id) on delete set null,
  price integer default 0,
  status text default 'requested',
  created_at timestamp with time zone default now()
);

-- Basic Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

-- Public read for services (optional)
create policy "Public read services" on public.services
  for select using (true);

-- Users can see self profile
create policy "Users select self" on public.users
  for select using (auth.uid() = auth_id);

-- Users can see their bookings
create policy "Users select own bookings" on public.bookings
  for select using (
    auth.uid() = customer_id or auth.uid() = provider_id
  );

-- Users can insert their bookings
create policy "Users insert bookings" on public.bookings
  for insert with check (auth.uid() = customer_id);
```

CORS
- Supabase REST/Realtime works cross-origin by default; the frontend uses the JS SDK so no extra CORS changes needed.

Usage Mapping
- Auth: email/password via Supabase Auth (see `js/services/supabase.service.js`).
- Services: CRUD via `services` table.
- Bookings: CRUD via `bookings` table.

Switching On/Off
- If `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `config.js`, the app uses Supabase-backed facades (`window.AuthApi`, `window.BookingApi`).
- If not set, it falls back to existing local/demo services.

Security Notes
- Keep anon key public but do not expose service_role keys in the client.
- Use RLS to restrict data access appropriately.


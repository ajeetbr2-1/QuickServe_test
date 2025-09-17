-- QuickServe Supabase Schema
-- Run in Supabase SQL editor

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

-- Indexes
create index if not exists idx_services_title on public.services (title);
create index if not exists idx_services_category on public.services (category);
create index if not exists idx_bookings_provider_created on public.bookings (provider_id, created_at desc);
create index if not exists idx_bookings_customer_created on public.bookings (customer_id, created_at desc);
create index if not exists idx_bookings_status on public.bookings (status);

-- RLS
alter table public.users enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

-- Policies
drop policy if exists "Public read services" on public.services;
create policy "Public read services" on public.services for select using (true);

-- Users can insert/update their own profile row
drop policy if exists "Users upsert self" on public.users;
create policy "Users upsert self" on public.users
  for insert with check (auth.uid() = auth_id);
create policy "Users update self" on public.users
  for update using (auth.uid() = auth_id);

drop policy if exists "Users select self" on public.users;
create policy "Users select self" on public.users for select using (auth.uid() = auth_id);

drop policy if exists "Users select own bookings" on public.bookings;
create policy "Users select own bookings" on public.bookings for select using (
  auth.uid() = customer_id or auth.uid() = provider_id
);

drop policy if exists "Users insert bookings" on public.bookings;
create policy "Users insert bookings" on public.bookings for insert with check (
  auth.uid() = customer_id
);

-- Users can update their bookings (e.g., cancel/reschedule)
drop policy if exists "Users update own bookings" on public.bookings;
create policy "Users update own bookings" on public.bookings for update using (
  auth.uid() = customer_id or auth.uid() = provider_id
);

-- Users can delete their own bookings (optional)
drop policy if exists "Users delete own bookings" on public.bookings;
create policy "Users delete own bookings" on public.bookings for delete using (
  auth.uid() = customer_id
);

-- Providers can manage their services
drop policy if exists "Providers insert services" on public.services;
create policy "Providers insert services" on public.services for insert with check (
  auth.uid() = provider_id
);
drop policy if exists "Providers update services" on public.services;
create policy "Providers update services" on public.services for update using (
  auth.uid() = provider_id
);
drop policy if exists "Providers delete services" on public.services;
create policy "Providers delete services" on public.services for delete using (
  auth.uid() = provider_id
);

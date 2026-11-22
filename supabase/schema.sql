-- Gishah beta schema.
-- Paste this whole file into the Supabase SQL editor (your project -> SQL Editor -> New query)
-- and click "Run" once. Safe to run again later — it only creates things if missing.

create extension if not exists "pgcrypto";

create table if not exists ministers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  role text,
  location text,
  bio text,
  initials text,
  created_at timestamptz not null default now()
);

create table if not exists itinerary_stops (
  id uuid primary key default gen_random_uuid(),
  minister_id uuid not null references ministers(id) on delete cascade,
  city text not null,
  venue text,
  event_date date not null,
  lat double precision not null,
  lon double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists updates (
  id uuid primary key default gen_random_uuid(),
  minister_id uuid not null references ministers(id) on delete cascade,
  title text not null,
  body text,
  created_at timestamptz not null default now()
);

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  minister_id uuid not null references ministers(id) on delete cascade,
  email text not null,
  radius_miles int not null default 150,
  lat double precision,
  lon double precision,
  location_label text,
  unsub_token uuid not null default gen_random_uuid(),
  unsubscribed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (minister_id, email)
);

create index if not exists idx_itinerary_minister on itinerary_stops(minister_id);
create index if not exists idx_subscribers_minister on subscribers(minister_id);

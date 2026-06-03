-- Create the airports table for global airport autocomplete and lookup
create table if not exists public.airports (
  id uuid primary key default gen_random_uuid(),
  iata_code text not null,
  airport_name text not null,
  city text not null,
  country text not null,
  country_code text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz default now()
);

create unique index if not exists idx_airports_iata_code on public.airports (iata_code);
create index if not exists idx_airports_city_lower on public.airports (lower(city));
create index if not exists idx_airports_country_lower on public.airports (lower(country));
create index if not exists idx_airports_airport_name_lower on public.airports (lower(airport_name));
create index if not exists idx_airports_country_code_lower on public.airports (lower(country_code));

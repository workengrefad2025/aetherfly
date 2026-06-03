-- AetherFly Booking Backend Upgrade
-- Adds enterprise-grade booking workflow support, seat inventory, pricing, boarding passes, analytics, and transactional RPCs.

-- Enums for booking workflow states and pricing categories
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE public.booking_status AS ENUM (
      'pending',
      'confirmed',
      'ticketed',
      'completed',
      'cancelled',
      'refunded'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM (
      'pending',
      'processing',
      'paid',
      'failed',
      'refunded'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'flight_status') THEN
    CREATE TYPE public.flight_status AS ENUM (
      'scheduled',
      'boarding',
      'departed',
      'delayed',
      'landed',
      'cancelled',
      'diverted'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
    CREATE TYPE public.ticket_status AS ENUM (
      'available',
      'issued',
      'cancelled',
      'boarded'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'seat_status') THEN
    CREATE TYPE public.seat_status AS ENUM (
      'available',
      'held',
      'reserved',
      'occupied',
      'unavailable'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cabin_class') THEN
    CREATE TYPE public.cabin_class AS ENUM (
      'Economy',
      'Premium Economy',
      'Business',
      'First'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fare_type') THEN
    CREATE TYPE public.fare_type AS ENUM (
      'basic',
      'standard',
      'flex',
      'premium',
      'refundable',
      'corporate'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'boarding_status') THEN
    CREATE TYPE public.boarding_status AS ENUM (
      'issued',
      'cancelled',
      'boarded',
      'completed'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'analytics_event_type') THEN
    CREATE TYPE public.analytics_event_type AS ENUM (
      'booking_created',
      'booking_confirmed',
      'payment_completed',
      'payment_refunded',
      'booking_cancelled',
      'seat_reserved',
      'seat_released',
      'boarding_pass_issued'
    );
  END IF;
END$$;

-- Extending flights for richer schedule, aircraft, and fare metadata
create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  airline text not null,
  flight_no text not null,
  from_code text not null,
  from_name text not null,
  to_code text not null,
  to_name text not null,
  depart_time text,
  arrive_time text,
  depart_date date,
  arrive_date date,
  duration text,
  flight_duration text,
  price numeric not null default 0,
  base_fare numeric not null default 0,
  tax_rate numeric not null default 0,
  currency text not null default 'USD',
  fare_type public.fare_type default 'standard',
  cabin_classes text[] default array['Economy'],
  aircraft_type text,
  flight_status public.flight_status default 'scheduled',
  terminal text,
  gate text,
  baggage_allowance text,
  total_seats integer default 0,
  available_seats integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.flights add column if not exists flight_duration text;
alter table public.flights add column if not exists base_fare numeric default 0;
alter table public.flights add column if not exists tax_rate numeric default 0;
alter table public.flights add column if not exists currency text default 'USD';
alter table public.flights add column if not exists fare_type public.fare_type default 'standard';
alter table public.flights add column if not exists cabin_classes text[] default array['Economy'];
alter table public.flights add column if not exists aircraft_type text;
alter table public.flights add column if not exists flight_status public.flight_status default 'scheduled';
alter table public.flights add column if not exists terminal text;
alter table public.flights add column if not exists gate text;
alter table public.flights add column if not exists baggage_allowance text;
alter table public.flights add column if not exists total_seats integer default 0;
alter table public.flights add column if not exists available_seats integer default 0;
alter table public.flights add column if not exists created_at timestamptz default now();
alter table public.flights add column if not exists updated_at timestamptz default now();

create index if not exists idx_flights_from_to_date on public.flights (from_code, to_code, depart_date);
create index if not exists idx_flights_airline on public.flights (airline);
create index if not exists idx_flights_flight_status on public.flights (flight_status);

-- Seat inventory and reservation state
create table if not exists public.flight_seats (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid references public.flights(id) on delete cascade,
  seat_code text not null,
  seat_class public.cabin_class not null,
  cabin_class public.cabin_class not null,
  fare_type public.fare_type default 'standard',
  seat_status public.seat_status not null default 'available',
  price_multiplier numeric not null default 1,
  base_fare numeric not null default 0,
  actual_price numeric not null default 0,
  reserved_by uuid references auth.users(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  reserved_at timestamptz,
  lock_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (flight_id, seat_code)
);

create index if not exists idx_flight_seats_flight_id on public.flight_seats (flight_id);
create index if not exists idx_flight_seats_status on public.flight_seats (seat_status);
create index if not exists idx_flight_seats_reserved_by on public.flight_seats (reserved_by);

-- Bookings with pricing, cabin, and workflow metadata
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text unique,
  ref_code text unique,
  user_id uuid references auth.users(id) on delete cascade,
  flight_id uuid references public.flights(id) on delete set null,
  passenger_name text not null,
  passenger_email text,
  passport_number text,
  seat_code text,
  seat_class public.cabin_class,
  cabin_class public.cabin_class,
  trip_type text,
  status public.booking_status default 'pending',
  price numeric not null default 0,
  currency text not null default 'USD',
  base_fare numeric not null default 0,
  tax_amount numeric not null default 0,
  fees numeric not null default 0,
  discount_amount numeric not null default 0,
  promo_code text,
  exchange_rate numeric not null default 1,
  fare_breakdown jsonb default '{}',
  flight_no text,
  airline text,
  from_code text,
  from_name text,
  to_code text,
  to_name text,
  depart_time text,
  arrive_time text,
  depart_date date,
  baggage_allowance text,
  terminal text,
  gate text,
  flight_duration text,
  boarding_group text,
  flight_status public.flight_status default 'scheduled',
  fare_type public.fare_type default 'standard',
  aircraft_type text,
  status_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bookings add column if not exists booking_reference text unique;
alter table public.bookings add column if not exists flight_id uuid references public.flights(id) on delete set null;
alter table public.bookings add column if not exists seat_class public.cabin_class;
alter table public.bookings add column if not exists cabin_class public.cabin_class;
alter table public.bookings add column if not exists status public.booking_status default 'pending';
alter table public.bookings add column if not exists currency text default 'USD';
alter table public.bookings add column if not exists base_fare numeric default 0;
alter table public.bookings add column if not exists tax_amount numeric default 0;
alter table public.bookings add column if not exists fees numeric default 0;
alter table public.bookings add column if not exists discount_amount numeric default 0;
alter table public.bookings add column if not exists promo_code text;
alter table public.bookings add column if not exists exchange_rate numeric default 1;
alter table public.bookings add column if not exists fare_breakdown jsonb default '{}';
alter table public.bookings add column if not exists baggage_allowance text;
alter table public.bookings add column if not exists terminal text;
alter table public.bookings add column if not exists gate text;
alter table public.bookings add column if not exists flight_duration text;
alter table public.bookings add column if not exists boarding_group text;
alter table public.bookings add column if not exists flight_status public.flight_status default 'scheduled';
alter table public.bookings add column if not exists fare_type public.fare_type default 'standard';
alter table public.bookings add column if not exists aircraft_type text;
alter table public.bookings add column if not exists status_note text;
alter table public.bookings add column if not exists updated_at timestamptz default now();

create index if not exists idx_bookings_user_id_created_at on public.bookings (user_id, created_at desc);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_flight_id on public.bookings (flight_id);
create index if not exists idx_bookings_booking_reference on public.bookings (booking_reference);

-- Extended payments and pricing capture
alter table public.payments add column if not exists payment_method text;
alter table public.payments add column if not exists tax_amount numeric default 0;
alter table public.payments add column if not exists fees numeric default 0;
alter table public.payments add column if not exists discount_amount numeric default 0;
alter table public.payments add column if not exists converted_amount numeric;
alter table public.payments add column if not exists exchange_rate numeric default 1;
alter table public.payments add column if not exists promo_code text;
alter table public.payments add column if not exists fare_breakdown jsonb default '{}';
alter table public.payments add column if not exists refunded_amount numeric default 0;
alter table public.payments add column if not exists updated_at timestamptz default now();
create index if not exists idx_payments_booking_ref on public.payments (booking_ref);
create index if not exists idx_payments_status on public.payments (status);

-- Rich ticket and boarding pass support
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  ticket_number text not null unique,
  ticket_status public.ticket_status default 'issued',
  qr_code_url text,
  qr_payload jsonb default '{}',
  boarding_group text,
  boarding_zone text,
  departure_gate text,
  boarding_time timestamptz,
  terminal text,
  seat_code text,
  seat_class public.cabin_class,
  cabin_class public.cabin_class,
  fare_type public.fare_type default 'standard',
  aircraft_type text,
  flight_status public.flight_status default 'scheduled',
  status_note text,
  issued_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tickets add column if not exists qr_payload jsonb default '{}';
alter table public.tickets add column if not exists boarding_group text;
alter table public.tickets add column if not exists boarding_zone text;
alter table public.tickets add column if not exists departure_gate text;
alter table public.tickets add column if not exists boarding_time timestamptz;
alter table public.tickets add column if not exists terminal text;
alter table public.tickets add column if not exists seat_class public.cabin_class;
alter table public.tickets add column if not exists cabin_class public.cabin_class;
alter table public.tickets add column if not exists fare_type public.fare_type default 'standard';
alter table public.tickets add column if not exists aircraft_type text;
alter table public.tickets add column if not exists flight_status public.flight_status default 'scheduled';
alter table public.tickets add column if not exists status_note text;
alter table public.tickets add column if not exists updated_at timestamptz default now();

create index if not exists idx_tickets_booking_id on public.tickets (booking_id);
create index if not exists idx_tickets_status on public.tickets (ticket_status);

create table if not exists public.boarding_passes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  ticket_id uuid references public.tickets(id) on delete set null,
  gate text,
  boarding_group text,
  boarding_zone text,
  boarding_time timestamptz,
  departure_gate text,
  terminal text,
  seat_code text,
  seat_class public.cabin_class,
  cabin_class public.cabin_class,
  qr_payload jsonb default '{}',
  qr_code_url text,
  status public.boarding_status default 'issued',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_boarding_passes_booking_id on public.boarding_passes (booking_id);
create index if not exists idx_boarding_passes_ticket_id on public.boarding_passes (ticket_id);
create index if not exists idx_boarding_passes_status on public.boarding_passes (status);

create table if not exists public.booking_passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  name text not null,
  passport_number text,
  email text,
  seat_code text,
  seat_class public.cabin_class,
  age_group text not null default 'adult',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_booking_passengers_booking_id on public.booking_passengers (booking_id);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_percent integer default 0,
  discount_amount numeric default 0,
  valid_from timestamptz,
  valid_until timestamptz,
  max_uses integer default 0,
  uses integer default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Analytics and event tracking
create table if not exists public.booking_events (
  id bigserial primary key,
  booking_id uuid references public.bookings(id) on delete cascade,
  event_type public.analytics_event_type not null,
  message text,
  payload jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_booking_events_booking_id on public.booking_events (booking_id);
create index if not exists idx_booking_events_event_type on public.booking_events (event_type);

create table if not exists public.payment_events (
  id bigserial primary key,
  payment_id uuid references public.payments(id) on delete cascade,
  event_type public.analytics_event_type not null,
  message text,
  payload jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_payment_events_payment_id on public.payment_events (payment_id);
create index if not exists idx_payment_events_event_type on public.payment_events (event_type);

create table if not exists public.seat_utilization (
  id bigserial primary key,
  flight_id uuid references public.flights(id) on delete cascade,
  snapshot_date date not null default current_date,
  seats_total integer default 0,
  seats_reserved integer default 0,
  seats_sold integer default 0,
  occupancy_rate numeric default 0,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create unique index if not exists idx_seat_utilization_flight_date on public.seat_utilization (flight_id, snapshot_date);

create table if not exists public.airline_usage_stats (
  id bigserial primary key,
  airline text,
  snapshot_date date not null default current_date,
  bookings_count integer default 0,
  revenue numeric default 0,
  seats_sold integer default 0,
  created_at timestamptz default now()
);

-- Ticket inventory and usage view
create or replace view public.flight_seat_summary as
select
  flight_id,
  count(*) filter (where seat_status = 'available') as available_seats,
  count(*) filter (where seat_status = 'reserved') as reserved_seats,
  count(*) filter (where seat_status = 'occupied') as occupied_seats,
  count(*) as total_seats,
  case when count(*) = 0 then 0 else round(100.0 * count(*) filter (where seat_status in ('reserved','occupied')) / count(*), 2) end as utilization_rate
from public.flight_seats
group by flight_id;

-- Utilities
create or replace function public.generate_booking_ref() returns text as $$
begin
  return 'AF-' || substr(md5(random()::text), 1, 8);
end;$$ language plpgsql stable;

create or replace function public.generate_ticket_number(prefix text) returns text as $$
begin
  return upper(prefix || '-' || substr(md5(random()::text), 1, 10));
end;$$ language plpgsql stable;

-- Seat reservation / optimistic lock support
create or replace function public.reserve_flight_seat(
  p_flight_id uuid,
  p_seat_code text,
  p_user_id uuid,
  p_hold_seconds integer default 300
) returns boolean as $$
declare
  rows_updated integer;
begin
  update public.flight_seats
  set seat_status = 'reserved',
      reserved_by = p_user_id,
      reserved_at = now(),
      lock_expires_at = now() + (p_hold_seconds || ' seconds')::interval,
      updated_at = now()
  where flight_id = p_flight_id
    and seat_code = p_seat_code
    and (
      seat_status = 'available'
      or (seat_status = 'reserved' and lock_expires_at < now())
      or (reserved_by = p_user_id)
    );

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  return rows_updated > 0;
end;$$ language plpgsql;

create or replace function public.release_flight_seat(
  p_flight_id uuid,
  p_seat_code text
) returns boolean as $$
declare
  rows_updated integer;
begin
  update public.flight_seats
  set seat_status = 'available',
      reserved_by = null,
      booking_id = null,
      reserved_at = null,
      lock_expires_at = null,
      updated_at = now()
  where flight_id = p_flight_id
    and seat_code = p_seat_code
    and seat_status in ('reserved', 'held');

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  return rows_updated > 0;
end;$$ language plpgsql;

-- Booking transaction support
create or replace function public.create_booking_transaction(
  booking_payload jsonb,
  payment_payload jsonb,
  ticket_payload jsonb,
  boarding_payload jsonb,
  passenger_payload jsonb
) returns jsonb as $$
declare
  booking_row public.bookings%rowtype;
  payment_row public.payments%rowtype;
  ticket_row public.tickets%rowtype;
  boarding_row public.boarding_passes%rowtype;
  passenger_row public.booking_passengers%rowtype;
  seat_flight_id uuid;
  seat_code text;
begin
  insert into public.bookings (
    id, booking_reference, ref_code, user_id, flight_id,
    passenger_name, passenger_email, passport_number,
    seat_code, seat_class, cabin_class, trip_type, status,
    price, currency, base_fare, tax_amount, fees, discount_amount,
    promo_code, exchange_rate, fare_breakdown,
    flight_no, airline, from_code, from_name, to_code, to_name,
    depart_time, arrive_time, depart_date, baggage_allowance,
    terminal, gate, flight_duration, boarding_group,
    flight_status, fare_type, aircraft_type, status_note,
    created_at, updated_at
  ) values (
    (booking_payload->>'id')::uuid,
    booking_payload->>'booking_reference',
    booking_payload->>'ref_code',
    (booking_payload->>'user_id')::uuid,
    nullif(booking_payload->>'flight_id','')::uuid,
    booking_payload->>'passenger_name',
    booking_payload->>'passenger_email',
    booking_payload->>'passport_number',
    booking_payload->>'seat_code',
    nullif(booking_payload->>'seat_class','')::public.cabin_class,
    nullif(booking_payload->>'cabin_class','')::public.cabin_class,
    booking_payload->>'trip_type',
    coalesce(nullif(booking_payload->>'status',''),'pending')::public.booking_status,
    coalesce((booking_payload->>'price')::numeric, 0),
    coalesce(nullif(booking_payload->>'currency',''),'USD'),
    coalesce((booking_payload->>'base_fare')::numeric, 0),
    coalesce((booking_payload->>'tax_amount')::numeric, 0),
    coalesce((booking_payload->>'fees')::numeric, 0),
    coalesce((booking_payload->>'discount_amount')::numeric, 0),
    booking_payload->>'promo_code',
    coalesce((booking_payload->>'exchange_rate')::numeric, 1),
    coalesce(booking_payload->'fare_breakdown', '{}'::jsonb),
    booking_payload->>'flight_no',
    booking_payload->>'airline',
    booking_payload->>'from_code',
    booking_payload->>'from_name',
    booking_payload->>'to_code',
    booking_payload->>'to_name',
    booking_payload->>'depart_time',
    booking_payload->>'arrive_time',
    nullif(booking_payload->>'depart_date','')::date,
    booking_payload->>'baggage_allowance',
    booking_payload->>'terminal',
    booking_payload->>'gate',
    booking_payload->>'flight_duration',
    booking_payload->>'boarding_group',
    coalesce(nullif(booking_payload->>'flight_status',''),'scheduled')::public.flight_status,
    coalesce(nullif(booking_payload->>'fare_type',''),'standard')::public.fare_type,
    booking_payload->>'aircraft_type',
    booking_payload->>'status_note',
    now(),
    now()
  ) returning * into booking_row;

  insert into public.payments (
    id, booking_id, booking_ref, user_id, provider,
    payment_method, currency, amount, tax_amount, fees,
    discount_amount, converted_amount, exchange_rate, promo_code,
    fare_breakdown, receipt_url, metadata, status,
    refunded_amount, charged_at, created_at, updated_at
  ) values (
    (payment_payload->>'id')::uuid,
    booking_row.id,
    payment_payload->>'booking_ref',
    (payment_payload->>'user_id')::uuid,
    payment_payload->>'provider',
    payment_payload->>'payment_method',
    coalesce(nullif(payment_payload->>'currency',''),'USD'),
    coalesce((payment_payload->>'amount')::numeric, 0),
    coalesce((payment_payload->>'tax_amount')::numeric, 0),
    coalesce((payment_payload->>'fees')::numeric, 0),
    coalesce((payment_payload->>'discount_amount')::numeric, 0),
    nullif((payment_payload->>'converted_amount'),'')::numeric,
    coalesce((payment_payload->>'exchange_rate')::numeric, 1),
    payment_payload->>'promo_code',
    coalesce(payment_payload->'fare_breakdown', '{}'::jsonb),
    payment_payload->>'receipt_url',
    coalesce(payment_payload->'metadata', '{}'::jsonb),
    coalesce(nullif(payment_payload->>'status',''),'pending')::public.payment_status,
    coalesce((payment_payload->>'refunded_amount')::numeric, 0),
    coalesce(nullif(payment_payload->>'charged_at','')::timestamptz, now()),
    now(),
    now()
  ) returning * into payment_row;

  insert into public.tickets (
    id, booking_id, ticket_number, ticket_status, qr_code_url,
    qr_payload, boarding_group, boarding_zone, departure_gate,
    boarding_time, terminal, seat_code, seat_class, cabin_class,
    fare_type, aircraft_type, flight_status, status_note,
    issued_at, updated_at
  ) values (
    (ticket_payload->>'id')::uuid,
    booking_row.id,
    ticket_payload->>'ticket_number',
    coalesce(nullif(ticket_payload->>'status',''),'issued')::public.ticket_status,
    ticket_payload->>'qr_code_url',
    coalesce(ticket_payload->'qr_payload', '{}'::jsonb),
    ticket_payload->>'boarding_group',
    ticket_payload->>'boarding_zone',
    ticket_payload->>'departure_gate',
    nullif(ticket_payload->>'boarding_time','')::timestamptz,
    ticket_payload->>'terminal',
    ticket_payload->>'seat_code',
    nullif(ticket_payload->>'seat_class','')::public.cabin_class,
    nullif(ticket_payload->>'cabin_class','')::public.cabin_class,
    coalesce(nullif(ticket_payload->>'fare_type',''),'standard')::public.fare_type,
    ticket_payload->>'aircraft_type',
    coalesce(nullif(ticket_payload->>'flight_status',''),'scheduled')::public.flight_status,
    ticket_payload->>'status_note',
    now(),
    now()
  ) returning * into ticket_row;

  insert into public.boarding_passes (
    id, booking_id, ticket_id, gate, boarding_group,
    boarding_zone, boarding_time, departure_gate, terminal,
    seat_code, seat_class, cabin_class, qr_payload, qr_code_url,
    status, created_at, updated_at
  ) values (
    (boarding_payload->>'id')::uuid,
    booking_row.id,
    ticket_row.id,
    boarding_payload->>'gate',
    boarding_payload->>'boarding_group',
    boarding_payload->>'boarding_zone',
    nullif(boarding_payload->>'boarding_time','')::timestamptz,
    boarding_payload->>'departure_gate',
    boarding_payload->>'terminal',
    boarding_payload->>'seat_code',
    nullif(boarding_payload->>'seat_class','')::public.cabin_class,
    nullif(boarding_payload->>'cabin_class','')::public.cabin_class,
    coalesce(boarding_payload->'qr_payload', '{}'::jsonb),
    boarding_payload->>'qr_code_url',
    coalesce(nullif(boarding_payload->>'status',''),'issued')::public.boarding_status,
    now(),
    now()
  ) returning * into boarding_row;

  insert into public.booking_passengers (
    id, booking_id, name, passport_number, email,
    seat_code, seat_class, age_group, created_at, updated_at
  ) values (
    (passenger_payload->>'id')::uuid,
    booking_row.id,
    passenger_payload->>'name',
    passenger_payload->>'passport_number',
    passenger_payload->>'email',
    passenger_payload->>'seat_code',
    nullif(passenger_payload->>'seat_class','')::public.cabin_class,
    coalesce(nullif(passenger_payload->>'age_group',''),'adult'),
    now(),
    now()
  ) returning * into passenger_row;

  insert into public.booking_events (booking_id, event_type, message, payload)
  values (
    booking_row.id,
    'booking_created',
    'Booking created and recorded as part of transaction.',
    jsonb_build_object('booking_reference', booking_row.booking_reference, 'booking_id', booking_row.id)
  );

  seat_flight_id := booking_payload->>'flight_id'::uuid;
  seat_code := booking_payload->>'seat_code';

  update public.flight_seats
  set seat_status = 'occupied',
      booking_id = booking_row.id,
      reserved_by = payment_row.user_id,
      reserved_at = now(),
      lock_expires_at = null,
      updated_at = now()
  where flight_id = seat_flight_id
    and seat_code = seat_code
    and seat_status in ('reserved', 'held', 'available');

  return jsonb_build_object(
    'booking', row_to_json(booking_row),
    'payment', row_to_json(payment_row),
    'ticket', row_to_json(ticket_row),
    'boarding_pass', row_to_json(boarding_row),
    'passenger', row_to_json(passenger_row)
  );
exception when others then
  raise;
end;$$ language plpgsql;

create or replace function public.confirm_payment_transaction(
  p_payment_id uuid
) returns jsonb as $$
declare
  payment_row public.payments%rowtype;
  booking_row public.bookings%rowtype;
begin
  update public.payments
  set status = 'paid',
      charged_at = now(),
      updated_at = now()
  where id = p_payment_id
  returning * into payment_row;

  if not found then
    raise exception 'Payment % not found', p_payment_id;
  end if;

  update public.bookings
  set status = 'confirmed',
      updated_at = now()
  where id = payment_row.booking_id
  returning * into booking_row;

  insert into public.payment_events (payment_id, event_type, message, payload)
  values (
    payment_row.id,
    'payment_completed',
    'Confirmed payment and linked booking updated.',
    jsonb_build_object('booking_id', booking_row.id, 'amount', payment_row.amount)
  );

  insert into public.booking_events (booking_id, event_type, message, payload)
  values (
    booking_row.id,
    'booking_confirmed',
    'Booking moved to confirmed status after payment.',
    jsonb_build_object('payment_id', payment_row.id, 'amount', payment_row.amount)
  );

  return jsonb_build_object('payment', row_to_json(payment_row), 'booking', row_to_json(booking_row));
end;$$ language plpgsql;

create or replace function public.issue_boarding_pass(
  p_booking_id uuid,
  boarding_payload jsonb
) returns jsonb as $$
declare
  booking_row public.bookings%rowtype;
  ticket_id uuid;
  boarding_row public.boarding_passes%rowtype;
begin
  select id into ticket_id from public.tickets where booking_id = p_booking_id limit 1;

  if ticket_id is null then
    raise exception 'No ticket found for booking %', p_booking_id;
  end if;

  update public.bookings
  set status = 'ticketed',
      updated_at = now()
  where id = p_booking_id
  returning * into booking_row;

  update public.tickets
  set ticket_status = 'issued',
      updated_at = now()
  where id = ticket_id;

  insert into public.boarding_passes (
    id, booking_id, ticket_id, gate, boarding_group,
    boarding_zone, boarding_time, departure_gate, terminal,
    seat_code, seat_class, cabin_class, qr_payload, qr_code_url,
    status, created_at, updated_at
  ) values (
    (boarding_payload->>'id')::uuid,
    p_booking_id,
    ticket_id,
    boarding_payload->>'gate',
    boarding_payload->>'boarding_group',
    boarding_payload->>'boarding_zone',
    nullif(boarding_payload->>'boarding_time','')::timestamptz,
    boarding_payload->>'departure_gate',
    boarding_payload->>'terminal',
    boarding_payload->>'seat_code',
    nullif(boarding_payload->>'seat_class','')::public.cabin_class,
    nullif(boarding_payload->>'cabin_class','')::public.cabin_class,
    coalesce(boarding_payload->'qr_payload', '{}'::jsonb),
    boarding_payload->>'qr_code_url',
    coalesce(nullif(boarding_payload->>'status',''),'issued')::public.boarding_status,
    now(),
    now()
  ) returning * into boarding_row;

  insert into public.booking_events (booking_id, event_type, message, payload)
  values (
    p_booking_id,
    'boarding_pass_issued',
    'Boarding pass generated for the booking.',
    jsonb_build_object('boarding_pass_id', boarding_row.id, 'ticket_id', ticket_id)
  );

  return row_to_json(boarding_row)::jsonb;
end;$$ language plpgsql;

create or replace function public.cancel_booking(
  p_booking_id uuid,
  p_reason text default null
) returns jsonb as $$
declare
  booking_row public.bookings%rowtype;
begin
  update public.bookings
  set status = 'cancelled',
      status_note = coalesce(p_reason, status_note),
      updated_at = now()
  where id = p_booking_id
  returning * into booking_row;

  if not found then
    raise exception 'Booking % not found', p_booking_id;
  end if;

  update public.tickets
  set ticket_status = 'cancelled',
      updated_at = now()
  where booking_id = p_booking_id;

  update public.boarding_passes
  set status = 'cancelled',
      updated_at = now()
  where booking_id = p_booking_id;

  update public.payments
  set status = 'refunded',
      refunded_amount = coalesce(amount, 0),
      updated_at = now()
  where booking_id = p_booking_id
    and status in ('pending', 'processing', 'paid');

  update public.flight_seats
  set seat_status = 'available',
      booking_id = null,
      reserved_by = null,
      reserved_at = null,
      lock_expires_at = null,
      updated_at = now()
  where booking_id = p_booking_id;

  insert into public.booking_events (booking_id, event_type, message, payload)
  values (
    p_booking_id,
    'booking_cancelled',
    'Booking cancelled and inventory released.',
    jsonb_build_object('reason', p_reason)
  );

  return jsonb_build_object('booking', row_to_json(booking_row));
end;$$ language plpgsql;

create or replace function public.refund_booking(
  p_booking_id uuid,
  p_refund_amount numeric default null,
  p_reason text default null
) returns jsonb as $$
declare
  refund_amount numeric := coalesce(p_refund_amount, 0);
  payment_row public.payments%rowtype;
  booking_row public.bookings%rowtype;
begin
  update public.payments
  set status = 'refunded',
      refunded_amount = coalesce(p_refund_amount, amount),
      updated_at = now()
  where booking_id = p_booking_id
    and status in ('paid', 'processing', 'pending')
  returning * into payment_row;

  if not found then
    raise exception 'No eligible payment found for refund on booking %', p_booking_id;
  end if;

  update public.bookings
  set status = 'refunded',
      status_note = coalesce(p_reason, status_note),
      updated_at = now()
  where id = p_booking_id
  returning * into booking_row;

  insert into public.payment_events (payment_id, event_type, message, payload)
  values (
    payment_row.id,
    'payment_refunded',
    'Refund processed for booking payment.',
    jsonb_build_object('refund_amount', refund_amount, 'reason', p_reason)
  );

  insert into public.booking_events (booking_id, event_type, message, payload)
  values (
    p_booking_id,
    'booking_cancelled',
    'Booking refunded and state synchronized.',
    jsonb_build_object('payment_id', payment_row.id, 'refund_amount', refund_amount)
  );

  return jsonb_build_object('booking', row_to_json(booking_row), 'payment', row_to_json(payment_row));
end;$$ language plpgsql;

-- Ensure RLS policies cover the new tables and preserve access semantics
alter table public.bookings enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'users_can_manage_own_bookings'
  ) THEN
    CREATE POLICY users_can_manage_own_bookings
      ON public.bookings
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

alter table public.flight_seats enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'flight_seats'
      AND policyname = 'flight_seats_owner'
  ) THEN
    CREATE POLICY flight_seats_owner
      ON public.flight_seats
      FOR SELECT
      USING (true);
  END IF;
END$$;

alter table public.tickets enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tickets'
      AND policyname = 'tickets_owner'
  ) THEN
    CREATE POLICY tickets_owner
      ON public.tickets
      FOR SELECT
      USING (exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()));
  END IF;
END$$;

alter table public.boarding_passes enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'boarding_passes'
      AND policyname = 'boarding_passes_owner'
  ) THEN
    CREATE POLICY boarding_passes_owner
      ON public.boarding_passes
      FOR SELECT
      USING (exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()));
  END IF;
END$$;

alter table public.booking_passengers enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'booking_passengers'
      AND policyname = 'booking_passengers_owner'
  ) THEN
    CREATE POLICY booking_passengers_owner
      ON public.booking_passengers
      FOR SELECT
      USING (exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()));
  END IF;
END$$;

alter table public.booking_events enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'booking_events'
      AND policyname = 'booking_events_owner'
  ) THEN
    CREATE POLICY booking_events_owner
      ON public.booking_events
      FOR SELECT
      USING (exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()));
  END IF;
END$$;

alter table public.payment_events enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payment_events'
      AND policyname = 'payment_events_owner'
  ) THEN
    CREATE POLICY payment_events_owner
      ON public.payment_events
      FOR SELECT
      USING (exists (select 1 from public.payments p where p.id = payment_id and p.user_id = auth.uid()));
  END IF;
END$$;

alter table public.seat_utilization enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'seat_utilization'
      AND policyname = 'seat_utilization_owner'
  ) THEN
    CREATE POLICY seat_utilization_owner
      ON public.seat_utilization
      FOR SELECT
      USING (true);
  END IF;
END$$;

alter table public.airline_usage_stats enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'airline_usage_stats'
      AND policyname = 'airline_usage_stats_owner'
  ) THEN
    CREATE POLICY airline_usage_stats_owner
      ON public.airline_usage_stats
      FOR SELECT
      USING (true);
  END IF;
END$$;

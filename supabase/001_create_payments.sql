-- Payments table
create table if not exists public.payments (
  id uuid primary key,
  booking_id uuid references public.bookings(id) on delete set null,
  booking_ref text,
  user_id uuid references public.user_profiles(id) on delete cascade,
  provider text not null,
  currency text not null,
  amount numeric not null,
  status text not null default 'pending',
  charged_at timestamptz default now(),
  receipt_url text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_payments_status on public.payments(status);

-- Payment logs for audit trail
create table if not exists public.payment_logs (
  id bigserial primary key,
  payment_id uuid references public.payments(id) on delete cascade,
  status text,
  message text,
  meta jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_payment_logs_payment_id on public.payment_logs(payment_id);

-- Booking timeline for lifecycle events
create table if not exists public.booking_timeline (
  id bigserial primary key,
  booking_id uuid references public.bookings(id) on delete cascade,
  event text not null,
  note text,
  actor text,
  created_at timestamptz default now()
);

create index if not exists idx_booking_timeline_booking_id on public.booking_timeline(booking_id);

-- Activity logs for analytics & admin
create table if not exists public.activity_logs (
  id bigserial primary key,
  user_id uuid references public.user_profiles(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  action text not null,
  payload jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_activity_logs_user_id on public.activity_logs(user_id);

-- Example RLS policies (simple templates)
-- Allow authenticated users to read their own payments
-- Note: adjust to your auth setup and role names
-- Enable RLS
alter table public.payments enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payments'
      AND policyname = 'payments_owner_select'
  ) THEN
    CREATE POLICY "payments_owner_select"
      ON public.payments
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payments'
      AND policyname = 'payments_owner_insert'
  ) THEN
    CREATE POLICY "payments_owner_insert"
      ON public.payments
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

alter table public.payment_logs enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payment_logs'
      AND policyname = 'payment_logs_owner'
  ) THEN
    CREATE POLICY "payment_logs_owner"
      ON public.payment_logs
      FOR SELECT
      USING (exists (select 1 from public.payments p where p.id = payment_id and p.user_id = auth.uid()));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payment_logs'
      AND policyname = 'payment_logs_insert'
  ) THEN
    CREATE POLICY "payment_logs_insert"
      ON public.payment_logs
      FOR INSERT
      WITH CHECK (exists (select 1 from public.payments p where p.id = new.payment_id and p.user_id = auth.uid()));
  END IF;
END$$;

alter table public.booking_timeline enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'booking_timeline'
      AND policyname = 'booking_timeline_read'
  ) THEN
    CREATE POLICY "booking_timeline_read"
      ON public.booking_timeline
      FOR SELECT
      USING (exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'booking_timeline'
      AND policyname = 'booking_timeline_insert'
  ) THEN
    CREATE POLICY "booking_timeline_insert"
      ON public.booking_timeline
      FOR INSERT
      WITH CHECK (exists (select 1 from public.bookings b where b.id = new.booking_id and b.user_id = auth.uid()));
  END IF;
END$$;

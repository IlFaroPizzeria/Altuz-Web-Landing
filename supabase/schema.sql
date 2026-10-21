-- Altuz: admission requests (the waitlist).
-- Run once in Supabase > SQL Editor. The public key can only INSERT; nobody outside can read the list.

create table if not exists public.admission_requests (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  email            text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  alias            text check (char_length(alias) <= 24),
  city             text check (char_length(city) <= 80),
  run_time         text check (run_time in ('dawn', 'night', 'day')),
  preferred_number smallint check (preferred_number between 1 and 100),
  referrer         text check (char_length(referrer) <= 120),
  pieces           text[] not null default '{}' check (pieces <@ array['tee-black', 'tee-white', 'race-short']::text[]),
  consent          boolean not null check (consent),
  consent_text     text not null check (char_length(consent_text) <= 400),
  source           text check (char_length(source) <= 40),
  status           text not null default 'pending' check (status in ('pending', 'admitted', 'declined')),
  notes            text
);

-- One request per email (case-insensitive). A repeat request returns 409, which the site treats as "received".
create unique index if not exists admission_requests_email_key on public.admission_requests (lower(email));
create index if not exists admission_requests_created_idx on public.admission_requests (created_at desc);

alter table public.admission_requests enable row level security;

-- Visitors (anon role) may only add a pending request. No select, update or delete policies exist for them.
drop policy if exists "visitors can request admission" on public.admission_requests;
create policy "visitors can request admission"
  on public.admission_requests for insert to anon
  with check (status = 'pending' and notes is null);

revoke all on public.admission_requests from anon, authenticated;
grant insert (email, alias, city, run_time, preferred_number, referrer, pieces, consent, consent_text, source)
  on public.admission_requests to anon;

-- Handy view for you in the dashboard: demand per number.
create or replace view public.number_demand with (security_invoker = true) as
  select preferred_number, count(*) as requests, min(created_at) as first_request
  from public.admission_requests
  group by preferred_number
  order by preferred_number;
revoke all on public.number_demand from anon, authenticated;

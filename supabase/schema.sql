create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner','manager','staff')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create table if not exists public.records (
  id uuid primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  record_type text not null check (record_type in ('production','sale','expense','delivery','payment','materialPurchase','materialUsage','cementSale','stockAdjustment')),
  payload jsonb not null default '{}'::jsonb,
  client_created_at timestamptz not null,
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  constraint records_payload_object check (jsonb_typeof(payload) = 'object')
);

-- If records already existed from the starter schema, expand the allowed types.
alter table public.records drop constraint if exists records_record_type_check;
alter table public.records add constraint records_record_type_check
  check (record_type in ('production','sale','expense','delivery','payment','materialPurchase','materialUsage','cementSale','stockAdjustment'));

create index if not exists records_business_created_idx
  on public.records (business_id, client_created_at desc);
create index if not exists records_business_type_idx
  on public.records (business_id, record_type);

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.records enable row level security;

-- Members can see the business memberships they belong to.
create policy "members can read their memberships"
on public.business_members for select to authenticated
using (user_id = (select auth.uid()));

create policy "members can read their businesses"
on public.businesses for select to authenticated
using (
  exists (
    select 1 from public.business_members m
    where m.business_id = businesses.id and m.user_id = (select auth.uid())
  )
);

create policy "members can read business records"
on public.records for select to authenticated
using (
  exists (
    select 1 from public.business_members m
    where m.business_id = records.business_id and m.user_id = (select auth.uid())
  )
);

create policy "members can insert business records as themselves"
on public.records for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.business_members m
    where m.business_id = records.business_id and m.user_id = (select auth.uid())
  )
);

-- Keep pilot records append-only from the client: no UPDATE/DELETE policies.
-- Upsert retries of an existing UUID need an UPDATE policy, so this starter uses
-- insert + duplicate detection in the sync layer. Existing IDs are treated as synced.
-- Add an audited manager-only edit workflow before allowing updates or deletes.

-- IMPORTANT: membership and business creation are intentionally admin-seeded in this
-- starter. Add a secure onboarding RPC/Edge Function before self-service sign-up.

begin;

alter table public.leads
  add column if not exists priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  add column if not exists estimated_value_paise integer check (estimated_value_paise is null or estimated_value_paise >= 0),
  add column if not exists last_contacted_at timestamptz,
  add column if not exists lost_reason text,
  add column if not exists internal_tags text[] not null default '{}',
  add column if not exists referral_code text,
  add column if not exists landing_page text,
  add column if not exists referrer text;

create table public.campaign_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  channel text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.communication_preferences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  channel text not null check (channel in ('email','whatsapp','phone')),
  operational_enabled boolean not null default true,
  marketing_enabled boolean not null default false,
  do_not_contact boolean not null default false,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (profile_id, channel)
);

create table public.marketing_interests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete restrict,
  lead_id uuid references public.leads(id) on delete restrict,
  category text not null check (category in ('Next cricket tournament','Badminton tournament','Football tournament','Box cricket','Corporate sports day','Company-exclusive tournament','Annual sports package','Sponsorship opportunity','Jersey or merchandise package','Travel and accommodation package')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (profile_id is not null or lead_id is not null)
);

create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  attempt_number integer not null check (attempt_number > 0),
  status text not null check (status in ('started','authorized','paid','failed','cancelled')),
  failure_code text,
  failure_message text,
  provider_reference text,
  created_at timestamptz not null default now(),
  unique (payment_id, attempt_number)
);

alter table public.payments drop constraint if exists payments_status_check;
alter table public.payments add constraint payments_status_check check (status in ('created','authorized','paid','failed','partially_refunded','refunded'));

create index leads_referral_code_idx on public.leads (referral_code) where referral_code is not null and deleted_at is null;
create index communication_preferences_profile_idx on public.communication_preferences (profile_id) where deleted_at is null;
create index marketing_interests_profile_idx on public.marketing_interests (profile_id) where profile_id is not null and deleted_at is null;
create index marketing_interests_lead_idx on public.marketing_interests (lead_id) where lead_id is not null and deleted_at is null;
create index payment_attempts_payment_idx on public.payment_attempts (payment_id, attempt_number desc);

alter table public.campaign_sources enable row level security;
alter table public.communication_preferences enable row level security;
alter table public.marketing_interests enable row level security;
alter table public.payment_attempts enable row level security;

create policy admin_campaign_sources_all on public.campaign_sources for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy preferences_self_select on public.communication_preferences for select to authenticated using (profile_id = (select auth.uid()) or (select public.is_admin()));
create policy preferences_self_write on public.communication_preferences for all to authenticated using (profile_id = (select auth.uid()) or (select public.is_admin())) with check (profile_id = (select auth.uid()) or (select public.is_admin()));
create policy consent_self_marketing_insert on public.consent_records for insert to authenticated with check (profile_id = (select auth.uid()) and lead_id is null and purpose = 'marketing');
create policy interests_self_select on public.marketing_interests for select to authenticated using (profile_id = (select auth.uid()) or (select public.is_admin()));
create policy interests_self_write on public.marketing_interests for all to authenticated using (profile_id = (select auth.uid()) or (select public.is_admin())) with check (profile_id = (select auth.uid()) or (select public.is_admin()));
create policy admin_payment_attempts_all on public.payment_attempts for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

commit;

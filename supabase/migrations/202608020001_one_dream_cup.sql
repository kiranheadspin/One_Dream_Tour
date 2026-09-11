begin;

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('admin', 'captain')),
  created_at timestamptz not null default now(),
  primary key (profile_id, role)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text,
  website text,
  billing_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  edition text not null,
  season_start date,
  season_end date,
  registration_fee_paise integer check (registration_fee_paise is null or registration_fee_paise >= 0),
  winner_prize_paise integer check (winner_prize_paise is null or winner_prize_paise >= 0),
  runner_up_prize_paise integer check (runner_up_prize_paise is null or runner_up_prize_paise >= 0),
  published boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (name, edition)
);

create table public.tournament_cities (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete restrict,
  city text not null,
  exact_date date,
  registration_deadline timestamptz,
  slot_capacity integer check (slot_capacity is null or slot_capacity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tournament_id, city)
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  tournament_city_id uuid not null references public.tournament_cities(id) on delete restrict,
  name text not null,
  address text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source text,
  medium text,
  campaign text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create sequence if not exists public.lead_reference_seq;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('ODC-' || to_char(current_date, 'YYMMDD') || '-' || lpad(nextval('public.lead_reference_seq')::text, 4, '0')),
  tournament_id uuid references public.tournaments(id) on delete restrict,
  campaign_id uuid references public.campaigns(id) on delete set null,
  captain_name text not null,
  display_name text not null,
  phone text not null,
  whatsapp text not null,
  email text not null,
  company_name text not null,
  relationship_to_company text not null,
  city text not null,
  approximate_team_size text not null,
  preferred_month text not null,
  company_approval text not null,
  source text not null,
  source_campaign text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  future_interests text[] not null default '{}',
  message text,
  stage text not null default 'New' check (stage in ('New','Contacted','Qualified','Slot reserved','Registration invited','Payment pending','Registered','Participated','Renewal opportunity','Lost','Archived')),
  assigned_to uuid references public.profiles(id) on delete set null,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete restrict,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete restrict,
  assigned_to uuid references public.profiles(id) on delete set null,
  due_at timestamptz not null,
  status text not null default 'open' check (status in ('open','completed','cancelled')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete restrict,
  company_id uuid not null references public.companies(id) on delete restrict,
  captain_profile_id uuid not null references public.profiles(id) on delete restrict,
  city_id uuid not null references public.tournament_cities(id) on delete restrict,
  name text not null,
  registration_status text not null default 'Draft' check (registration_status in ('Draft','Payment pending','Registered','Withdrawn')),
  rules_accepted_at timestamptz,
  rules_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tournament_id, name)
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete restrict,
  full_name text not null,
  email text not null,
  phone text not null,
  employee_id text not null,
  shirt_size text,
  is_captain boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (team_id, email),
  unique (team_id, employee_id)
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete restrict,
  team_id uuid not null unique references public.teams(id) on delete restrict,
  invited_at timestamptz,
  submitted_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.registration_steps (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete restrict,
  step_key text not null,
  completed_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (registration_id, step_key)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete restrict,
  provider text not null default 'razorpay',
  provider_order_id text not null unique,
  provider_payment_id text unique,
  amount_paise integer not null check (amount_paise >= 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null check (status in ('created','authorized','paid','failed','refunded')),
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete restrict,
  provider_event_id text not null unique,
  event_type text not null,
  signature_verified boolean not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  provider_refund_id text unique,
  amount_paise integer not null check (amount_paise > 0),
  status text not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete restrict,
  owner_profile_id uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null unique,
  original_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete restrict,
  profile_id uuid references public.profiles(id) on delete restrict,
  purpose text not null check (purpose in ('operations','marketing')),
  granted boolean not null,
  policy_version text not null,
  source text not null,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now(),
  check (lead_id is not null or profile_id is not null)
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  lead_id uuid references public.leads(id) on delete set null,
  kind text not null,
  stage text not null,
  owner_id uuid references public.profiles(id) on delete set null,
  value_paise integer check (value_paise is null or value_paise >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete restrict,
  title text not null,
  body text not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  before_data jsonb,
  after_data jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.content_pages (
  slug text primary key,
  title text not null,
  body jsonb not null,
  published boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index leads_active_stage_created_idx on public.leads (stage, created_at desc) where deleted_at is null;
create index leads_active_city_created_idx on public.leads (city, created_at desc) where deleted_at is null;
create index leads_email_lower_idx on public.leads (lower(email));
create index leads_assigned_follow_up_idx on public.leads (assigned_to, next_follow_up_at) where deleted_at is null and next_follow_up_at is not null;
create index leads_campaign_id_idx on public.leads (campaign_id);
create index lead_activities_lead_created_idx on public.lead_activities (lead_id, created_at desc);
create index follow_ups_lead_id_idx on public.follow_ups (lead_id);
create index teams_captain_profile_id_idx on public.teams (captain_profile_id) where deleted_at is null;
create index teams_company_id_idx on public.teams (company_id) where deleted_at is null;
create index teams_city_id_idx on public.teams (city_id) where deleted_at is null;
create index team_members_team_id_idx on public.team_members (team_id) where deleted_at is null;
create index registration_steps_registration_id_idx on public.registration_steps (registration_id);
create index payments_registration_id_idx on public.payments (registration_id, created_at desc);
create index payment_events_payment_id_idx on public.payment_events (payment_id, received_at desc);
create index refunds_payment_id_idx on public.refunds (payment_id);
create index documents_team_id_idx on public.documents (team_id) where deleted_at is null;
create index consent_records_lead_created_idx on public.consent_records (lead_id, created_at desc) where lead_id is not null;
create index opportunities_company_id_idx on public.opportunities (company_id) where deleted_at is null;
create index announcements_tournament_id_idx on public.announcements (tournament_id) where deleted_at is null;
create index audit_logs_target_idx on public.audit_logs (target_type, target_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profile_roles
    where profile_id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.profile_roles enable row level security;
alter table public.companies enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_cities enable row level security;
alter table public.venues enable row level security;
alter table public.campaigns enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.follow_ups enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_steps enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.refunds enable row level security;
alter table public.documents enable row level security;
alter table public.consent_records enable row level security;
alter table public.opportunities enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;
alter table public.app_settings enable row level security;
alter table public.content_pages enable row level security;

create policy profiles_self_or_admin_select on public.profiles for select to authenticated using ((select auth.uid()) = id or (select public.is_admin()));
create policy profiles_self_update on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy roles_self_or_admin_select on public.profile_roles for select to authenticated using ((select auth.uid()) = profile_id or (select public.is_admin()));

create policy published_tournaments_public_select on public.tournaments for select to anon, authenticated using (published and deleted_at is null);
create policy published_cities_public_select on public.tournament_cities for select to anon, authenticated using (deleted_at is null and exists (select 1 from public.tournaments t where t.id = tournament_id and t.published));
create policy published_venues_public_select on public.venues for select to anon, authenticated using (published and deleted_at is null);
create policy published_announcements_public_select on public.announcements for select to anon, authenticated using (published_at is not null and published_at <= now() and deleted_at is null);
create policy published_content_public_select on public.content_pages for select to anon, authenticated using (published and deleted_at is null);

create policy teams_captain_select on public.teams for select to authenticated using (captain_profile_id = (select auth.uid()) or (select public.is_admin()));
create policy teams_captain_update on public.teams for update to authenticated using (captain_profile_id = (select auth.uid()) or (select public.is_admin())) with check (captain_profile_id = (select auth.uid()) or (select public.is_admin()));
create policy members_team_captain_select on public.team_members for select to authenticated using (exists (select 1 from public.teams t where t.id = team_id and (t.captain_profile_id = (select auth.uid()) or (select public.is_admin()))));
create policy members_team_captain_write on public.team_members for all to authenticated using (exists (select 1 from public.teams t where t.id = team_id and (t.captain_profile_id = (select auth.uid()) or (select public.is_admin())))) with check (exists (select 1 from public.teams t where t.id = team_id and (t.captain_profile_id = (select auth.uid()) or (select public.is_admin()))));
create policy registrations_team_captain_select on public.registrations for select to authenticated using (exists (select 1 from public.teams t where t.id = team_id and (t.captain_profile_id = (select auth.uid()) or (select public.is_admin()))));
create policy registration_steps_team_captain_select on public.registration_steps for select to authenticated using (exists (select 1 from public.registrations r join public.teams t on t.id = r.team_id where r.id = registration_id and (t.captain_profile_id = (select auth.uid()) or (select public.is_admin()))));
create policy payments_team_captain_select on public.payments for select to authenticated using (exists (select 1 from public.registrations r join public.teams t on t.id = r.team_id where r.id = registration_id and (t.captain_profile_id = (select auth.uid()) or (select public.is_admin()))));
create policy documents_owner_team_select on public.documents for select to authenticated using (owner_profile_id = (select auth.uid()) or (select public.is_admin()));

create policy admin_companies_all on public.companies for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_tournaments_all on public.tournaments for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_cities_all on public.tournament_cities for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_venues_all on public.venues for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_campaigns_all on public.campaigns for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_leads_all on public.leads for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_lead_activities_all on public.lead_activities for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_follow_ups_all on public.follow_ups for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_registrations_all on public.registrations for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_registration_steps_all on public.registration_steps for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_payments_all on public.payments for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_payment_events_all on public.payment_events for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_refunds_all on public.refunds for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_consents_select on public.consent_records for select to authenticated using ((select public.is_admin()));
create policy admin_opportunities_all on public.opportunities for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_announcements_all on public.announcements for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_audit_select on public.audit_logs for select to authenticated using ((select public.is_admin()));
create policy admin_settings_all on public.app_settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_content_all on public.content_pages for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

revoke update, delete on public.consent_records from anon, authenticated;
revoke update, delete on public.payment_events from anon, authenticated;
revoke update, delete on public.audit_logs from anon, authenticated;

commit;

begin;

-- Provision a profile for every invited Supabase Auth user. Roles remain an
-- explicit organizer-controlled assignment in public.profile_roles.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
begin
  profile_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  if profile_name is null then
    profile_name := nullif(split_part(coalesce(new.email, ''), '@', 1), '');
  end if;
  if profile_name is null or char_length(profile_name) < 2 then
    profile_name := 'Invited user';
  end if;

  insert into public.profiles (id, full_name)
  values (new.id, left(profile_name, 120))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- A single active lead is allowed per normalized email and city. This closes
-- the race between duplicate detection and insert in concurrent requests.
create unique index if not exists leads_active_email_city_unique_idx
  on public.leads (lower(email), city)
  where deleted_at is null;

create table if not exists public.request_rate_limits (
  key_hash text primary key check (char_length(key_hash) = 64),
  request_count integer not null check (request_count > 0),
  window_started_at timestamptz not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  check (expires_at > window_started_at)
);

create index if not exists request_rate_limits_expires_idx
  on public.request_rate_limits (expires_at);

alter table public.request_rate_limits enable row level security;
revoke all on table public.request_rate_limits from public, anon, authenticated;

create or replace function public.consume_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
  current_expiry timestamptz;
  request_timestamp timestamptz := statement_timestamp();
begin
  if char_length(p_key_hash) <> 64 or p_limit < 1 or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate-limit parameters' using errcode = '22023';
  end if;

  insert into public.request_rate_limits as rate (
    key_hash,
    request_count,
    window_started_at,
    expires_at,
    updated_at
  )
  values (
    p_key_hash,
    1,
    request_timestamp,
    request_timestamp + make_interval(secs => p_window_seconds),
    request_timestamp
  )
  on conflict (key_hash) do update
  set request_count = case when rate.expires_at <= request_timestamp then 1 else rate.request_count + 1 end,
      window_started_at = case when rate.expires_at <= request_timestamp then request_timestamp else rate.window_started_at end,
      expires_at = case when rate.expires_at <= request_timestamp then request_timestamp + make_interval(secs => p_window_seconds) else rate.expires_at end,
      updated_at = request_timestamp
  returning rate.request_count, rate.expires_at
  into current_count, current_expiry;

  return query select
    current_count <= p_limit,
    case when current_count <= p_limit then 0 else greatest(1, ceil(extract(epoch from current_expiry - request_timestamp))::integer) end;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

-- The public enquiry and its consent evidence are committed in one database
-- transaction. Only the server-side service role may invoke this function.
create or replace function public.submit_public_lead(
  p_input jsonb,
  p_policy_version text,
  p_ip_hash text default null,
  p_user_agent_hash text default null
)
returns table (lead_id uuid, lead_reference text, duplicate boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_lead_id uuid;
  created_lead_reference text;
  normalized_email text := lower(btrim(p_input ->> 'email'));
begin
  if normalized_email = '' or p_policy_version = '' then
    raise exception 'Invalid lead submission' using errcode = '22023';
  end if;

  insert into public.leads (
    captain_name,
    display_name,
    phone,
    whatsapp,
    email,
    company_name,
    relationship_to_company,
    city,
    approximate_team_size,
    preferred_month,
    company_approval,
    source,
    source_campaign,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    referral_code,
    landing_page,
    referrer,
    future_interests,
    message
  )
  values (
    p_input ->> 'captainName',
    p_input ->> 'displayName',
    p_input ->> 'phone',
    p_input ->> 'whatsapp',
    normalized_email,
    p_input ->> 'company',
    p_input ->> 'relationship',
    p_input ->> 'city',
    p_input ->> 'teamSize',
    p_input ->> 'preferredMonth',
    p_input ->> 'companyApproval',
    p_input ->> 'source',
    nullif(p_input ->> 'campaign', ''),
    nullif(p_input ->> 'utmSource', ''),
    nullif(p_input ->> 'utmMedium', ''),
    nullif(p_input ->> 'utmCampaign', ''),
    nullif(p_input ->> 'utmTerm', ''),
    nullif(p_input ->> 'utmContent', ''),
    nullif(p_input ->> 'referralCode', ''),
    nullif(p_input ->> 'landingPage', ''),
    nullif(p_input ->> 'referrer', ''),
    coalesce(array(select jsonb_array_elements_text(coalesce(p_input -> 'futureInterests', '[]'::jsonb))), '{}'::text[]),
    nullif(p_input ->> 'message', '')
  )
  on conflict (lower(email), city) where deleted_at is null do nothing
  returning id, reference into created_lead_id, created_lead_reference;

  if created_lead_id is null then
    select leads.id, leads.reference
    into created_lead_id, created_lead_reference
    from public.leads
    where lower(leads.email) = normalized_email
      and leads.city = (p_input ->> 'city')
      and leads.deleted_at is null
    order by leads.created_at
    limit 1;

    return query select created_lead_id, created_lead_reference, true;
    return;
  end if;

  insert into public.consent_records (
    lead_id,
    purpose,
    granted,
    policy_version,
    source,
    ip_hash,
    user_agent_hash
  )
  values
    (created_lead_id, 'operations', true, p_policy_version, 'public-enquiry-form', p_ip_hash, p_user_agent_hash),
    (created_lead_id, 'marketing', coalesce((p_input ->> 'marketingConsent')::boolean, false), p_policy_version, 'public-enquiry-form', p_ip_hash, p_user_agent_hash);

  return query select created_lead_id, created_lead_reference, false;
end;
$$;

revoke all on function public.submit_public_lead(jsonb, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_public_lead(jsonb, text, text, text) to service_role;

commit;

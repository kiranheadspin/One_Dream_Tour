begin;

-- A captain can own only one active team in a tournament. The partial unique
-- index also makes repeated invitation requests safe under concurrency.
create unique index if not exists teams_tournament_captain_active_unique_idx
  on public.teams (tournament_id, captain_profile_id)
  where deleted_at is null;

create index if not exists registrations_lead_id_idx
  on public.registrations (lead_id)
  where lead_id is not null and deleted_at is null;

create or replace function public.provision_captain_invitation(
  p_lead_id uuid,
  p_captain_profile_id uuid,
  p_captain_name text,
  p_team_name text,
  p_actor_id uuid
)
returns table (
  team_id uuid,
  registration_id uuid,
  newly_provisioned boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  lead_record public.leads%rowtype;
  selected_tournament_id uuid;
  selected_city_id uuid;
  selected_company_id uuid;
  selected_team_id uuid;
  selected_registration_id uuid;
  created_team boolean := false;
begin
  if p_lead_id is null or p_captain_profile_id is null or p_actor_id is null then
    raise exception 'Invitation identifiers are required' using errcode = '22023';
  end if;
  if char_length(btrim(p_captain_name)) not between 2 and 120 then
    raise exception 'Captain name is invalid' using errcode = '22023';
  end if;
  if char_length(btrim(p_team_name)) not between 2 and 120 then
    raise exception 'Team name is invalid' using errcode = '22023';
  end if;

  -- Serialize provisioning for one lead so two admin clicks cannot create two
  -- companies, teams, or registrations.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_lead_id::text, 0));

  select leads.*
    into lead_record
  from public.leads
  where leads.id = p_lead_id
    and leads.deleted_at is null
  for update;

  if not found then
    raise exception 'Lead not found' using errcode = 'P0002';
  end if;

  insert into public.profiles (id, full_name)
  values (p_captain_profile_id, left(btrim(p_captain_name), 120))
  on conflict (id) do update
    set full_name = excluded.full_name,
        updated_at = pg_catalog.now(),
        deleted_at = null;

  insert into public.profile_roles (profile_id, role)
  values (p_captain_profile_id, 'captain')
  on conflict (profile_id, role) do nothing;

  selected_tournament_id := lead_record.tournament_id;
  if selected_tournament_id is null then
    select tournaments.id
      into selected_tournament_id
    from public.tournaments
    where tournaments.published
      and tournaments.deleted_at is null
    order by tournaments.season_start desc nulls last, tournaments.created_at desc
    limit 1;
  end if;

  if selected_tournament_id is null then
    raise exception 'No published tournament is available' using errcode = 'P0001';
  end if;

  select tournament_cities.id
    into selected_city_id
  from public.tournament_cities
  where tournament_cities.tournament_id = selected_tournament_id
    and lower(tournament_cities.city) = lower(lead_record.city)
    and tournament_cities.deleted_at is null
  limit 1;

  if selected_city_id is null then
    raise exception 'The lead city is not configured for the tournament' using errcode = 'P0001';
  end if;

  select companies.id
    into selected_company_id
  from public.companies
  where lower(companies.legal_name) = lower(lead_record.company_name)
    and companies.deleted_at is null
  order by companies.created_at
  limit 1;

  if selected_company_id is null then
    insert into public.companies (legal_name, display_name, billing_email)
    values (lead_record.company_name, lead_record.company_name, lower(lead_record.email))
    returning id into selected_company_id;
  end if;

  select teams.id
    into selected_team_id
  from public.teams
  where teams.tournament_id = selected_tournament_id
    and teams.captain_profile_id = p_captain_profile_id
    and teams.deleted_at is null
  limit 1;

  if selected_team_id is null then
    insert into public.teams (
      tournament_id,
      company_id,
      captain_profile_id,
      city_id,
      name,
      registration_status
    )
    values (
      selected_tournament_id,
      selected_company_id,
      p_captain_profile_id,
      selected_city_id,
      btrim(p_team_name),
      'Draft'
    )
    returning id into selected_team_id;
    created_team := true;
  else
    update public.teams
      set company_id = selected_company_id,
          city_id = selected_city_id,
          name = btrim(p_team_name),
          updated_at = pg_catalog.now()
    where id = selected_team_id;
  end if;

  insert into public.registrations (lead_id, team_id, invited_at)
  values (p_lead_id, selected_team_id, pg_catalog.now())
  on conflict on constraint registrations_team_id_key do update
    set lead_id = coalesce(public.registrations.lead_id, excluded.lead_id),
        invited_at = pg_catalog.now(),
        updated_at = pg_catalog.now(),
        deleted_at = null
  returning id into selected_registration_id;

  update public.leads
    set tournament_id = selected_tournament_id,
        stage = 'Registration invited',
        updated_at = pg_catalog.now()
  where id = p_lead_id;

  insert into public.lead_activities (lead_id, actor_id, kind, note, metadata)
  values (
    p_lead_id,
    p_actor_id,
    'captain.invitation_requested',
    case when created_team then 'Captain access and registration provisioned.' else 'Captain invitation requested again.' end,
    pg_catalog.jsonb_build_object(
      'captain_profile_id', p_captain_profile_id,
      'team_id', selected_team_id,
      'registration_id', selected_registration_id,
      'newly_provisioned', created_team
    )
  );

  insert into public.audit_logs (actor_id, action, target_type, target_id, after_data)
  values (
    p_actor_id,
    'captain.invitation_requested',
    'team',
    selected_team_id,
    pg_catalog.jsonb_build_object(
      'lead_id', p_lead_id,
      'captain_profile_id', p_captain_profile_id,
      'registration_id', selected_registration_id,
      'newly_provisioned', created_team
    )
  );

  return query select selected_team_id, selected_registration_id, created_team;
end;
$$;

revoke all on function public.provision_captain_invitation(uuid, uuid, text, text, uuid) from public, anon, authenticated;
grant execute on function public.provision_captain_invitation(uuid, uuid, text, text, uuid) to service_role;

commit;

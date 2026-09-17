begin;

create table public.fixtures (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete restrict,
  venue_id uuid not null references public.venues(id) on delete restrict,
  home_team_id uuid not null references public.teams(id) on delete restrict,
  away_team_id uuid not null references public.teams(id) on delete restrict,
  round_name text not null,
  match_number integer not null check (match_number between 1 and 999),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft','published','cancelled')),
  notes text,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (home_team_id <> away_team_id),
  check (ends_at > starts_at),
  check (char_length(btrim(round_name)) between 2 and 80),
  check (notes is null or char_length(notes) <= 500),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create index fixtures_tournament_start_idx on public.fixtures (tournament_id, starts_at) where deleted_at is null;
create index fixtures_home_team_start_idx on public.fixtures (home_team_id, starts_at) where deleted_at is null;
create index fixtures_away_team_start_idx on public.fixtures (away_team_id, starts_at) where deleted_at is null;
create index fixtures_venue_start_idx on public.fixtures (venue_id, starts_at) where deleted_at is null;

alter table public.announcements
  add column fixture_id uuid unique references public.fixtures(id) on delete set null;

alter table public.fixtures enable row level security;

create policy published_fixtures_authenticated_select
on public.fixtures for select to authenticated
using (status = 'published' and published_at <= now() and deleted_at is null);

create policy admin_fixtures_all
on public.fixtures for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

grant select, insert, update, delete on table public.fixtures to authenticated;
grant select, insert, update, delete on table public.fixtures to service_role;

create or replace function public.save_fixture(
  p_fixture_id uuid,
  p_venue_id uuid,
  p_home_team_id uuid,
  p_away_team_id uuid,
  p_round_name text,
  p_match_number integer,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_status text,
  p_notes text default null
)
returns public.fixtures
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_tournament_id uuid;
  home_tournament_id uuid;
  away_tournament_id uuid;
  home_team_name text;
  away_team_name text;
  target_city text;
  target_venue_name text;
  conflicting_fixture public.fixtures%rowtype;
  existing_fixture public.fixtures%rowtype;
  saved_fixture public.fixtures%rowtype;
  announcement_title text;
  announcement_body text;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;
  if p_home_team_id = p_away_team_id then
    raise exception 'Choose two different teams.' using errcode = '22023';
  end if;
  if p_ends_at <= p_starts_at then
    raise exception 'The end time must be after the start time.' using errcode = '22023';
  end if;
  if p_status not in ('draft', 'published', 'cancelled') then
    raise exception 'Invalid fixture status.' using errcode = '22023';
  end if;

  select city.tournament_id, city.city, venue.name
  into target_tournament_id, target_city, target_venue_name
  from public.venues as venue
  join public.tournament_cities as city on city.id = venue.tournament_city_id
  where venue.id = p_venue_id
    and venue.deleted_at is null
    and city.deleted_at is null;
  if not found then
    raise exception 'The selected venue is not available.' using errcode = '23503';
  end if;

  select team.tournament_id, coalesce(team.member_name, team.name)
  into home_tournament_id, home_team_name
  from public.teams as team
  where team.id = p_home_team_id and team.deleted_at is null;
  select team.tournament_id, coalesce(team.member_name, team.name)
  into away_tournament_id, away_team_name
  from public.teams as team
  where team.id = p_away_team_id and team.deleted_at is null;
  if home_tournament_id is null or away_tournament_id is null then
    raise exception 'The selected team is not available.' using errcode = '23503';
  end if;
  if home_tournament_id <> target_tournament_id or away_tournament_id <> target_tournament_id then
    raise exception 'Both teams and the venue must belong to the same tournament.' using errcode = '23514';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_tournament_id::text, 0));

  if p_fixture_id is not null then
    select * into existing_fixture
    from public.fixtures
    where id = p_fixture_id and deleted_at is null
    for update;
    if not found then
      return null;
    end if;
    if existing_fixture.tournament_id <> target_tournament_id then
      raise exception 'The fixture cannot move to another tournament.' using errcode = '23514';
    end if;
  end if;

  select * into conflicting_fixture
  from public.fixtures as fixture
  where fixture.deleted_at is null
    and fixture.status <> 'cancelled'
    and (p_fixture_id is null or fixture.id <> p_fixture_id)
    and fixture.starts_at < p_ends_at
    and fixture.ends_at > p_starts_at
    and (
      fixture.venue_id = p_venue_id
      or fixture.home_team_id in (p_home_team_id, p_away_team_id)
      or fixture.away_team_id in (p_home_team_id, p_away_team_id)
    )
  order by fixture.starts_at
  limit 1;
  if found then
    raise exception 'Fixture conflicts with % match % for the selected venue or team.', conflicting_fixture.round_name, conflicting_fixture.match_number
      using errcode = '23P01';
  end if;

  if p_fixture_id is null then
    insert into public.fixtures (
      tournament_id, venue_id, home_team_id, away_team_id, round_name, match_number,
      starts_at, ends_at, status, notes, published_at, created_by, updated_by
    ) values (
      target_tournament_id, p_venue_id, p_home_team_id, p_away_team_id, btrim(p_round_name), p_match_number,
      p_starts_at, p_ends_at, p_status, nullif(btrim(p_notes), ''),
      case when p_status = 'published' then pg_catalog.now() else null end,
      (select auth.uid()), (select auth.uid())
    ) returning * into saved_fixture;
  else
    update public.fixtures
    set venue_id = p_venue_id,
        home_team_id = p_home_team_id,
        away_team_id = p_away_team_id,
        round_name = btrim(p_round_name),
        match_number = p_match_number,
        starts_at = p_starts_at,
        ends_at = p_ends_at,
        status = p_status,
        notes = nullif(btrim(p_notes), ''),
        published_at = case
          when p_status = 'published' then coalesce(published_at, pg_catalog.now())
          else null
        end,
        updated_by = (select auth.uid()),
        updated_at = pg_catalog.now()
    where id = p_fixture_id
    returning * into saved_fixture;
  end if;

  announcement_title := pg_catalog.format('%s: %s vs %s', saved_fixture.round_name, home_team_name, away_team_name);
  announcement_body := pg_catalog.format(
    '%s fixture confirmed at %s on %s. Open Schedule for the verified match details.',
    target_city,
    target_venue_name,
    pg_catalog.to_char(saved_fixture.starts_at at time zone 'Asia/Kolkata', 'FMDay, DD FMMonth YYYY at HH12:MI AM')
  );

  if saved_fixture.status = 'published' then
    update public.venues set published = true, updated_at = pg_catalog.now() where id = saved_fixture.venue_id;
  end if;

  insert into public.announcements (tournament_id, fixture_id, title, body, published_at)
  values (
    saved_fixture.tournament_id,
    saved_fixture.id,
    announcement_title,
    announcement_body,
    case when saved_fixture.status = 'published' then saved_fixture.published_at else null end
  )
  on conflict (fixture_id) do update
  set title = excluded.title,
      body = excluded.body,
      published_at = excluded.published_at,
      updated_at = pg_catalog.now(),
      deleted_at = null;

  insert into public.audit_logs (actor_id, action, target_type, target_id, before_data, after_data)
  values (
    (select auth.uid()),
    case when p_fixture_id is null then 'fixture.created' else 'fixture.updated' end,
    'fixture',
    saved_fixture.id,
    case when p_fixture_id is null then null else pg_catalog.to_jsonb(existing_fixture) end,
    pg_catalog.to_jsonb(saved_fixture)
  );

  return saved_fixture;
end;
$$;

revoke all on function public.save_fixture(uuid, uuid, uuid, uuid, text, integer, timestamptz, timestamptz, text, text) from public, anon, authenticated;
grant execute on function public.save_fixture(uuid, uuid, uuid, uuid, text, integer, timestamptz, timestamptz, text, text) to authenticated;

create or replace function public.get_my_published_fixtures()
returns table (
  id uuid,
  tournament_id uuid,
  venue_id uuid,
  venue_name text,
  venue_address text,
  city text,
  home_team_id uuid,
  home_team_name text,
  away_team_id uuid,
  away_team_name text,
  round_name text,
  match_number integer,
  starts_at timestamptz,
  ends_at timestamptz,
  status text,
  notes text,
  published_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    fixture.id,
    fixture.tournament_id,
    fixture.venue_id,
    venue.name,
    venue.address,
    tournament_city.city,
    fixture.home_team_id,
    coalesce(home_team.member_name, home_team.name),
    fixture.away_team_id,
    coalesce(away_team.member_name, away_team.name),
    fixture.round_name,
    fixture.match_number,
    fixture.starts_at,
    fixture.ends_at,
    fixture.status,
    fixture.notes,
    fixture.published_at,
    fixture.updated_at
  from public.fixtures as fixture
  join public.venues as venue on venue.id = fixture.venue_id
  join public.tournament_cities as tournament_city on tournament_city.id = venue.tournament_city_id
  join public.teams as home_team on home_team.id = fixture.home_team_id
  join public.teams as away_team on away_team.id = fixture.away_team_id
  where fixture.status = 'published'
    and fixture.published_at <= pg_catalog.now()
    and fixture.deleted_at is null
    and venue.deleted_at is null
    and home_team.deleted_at is null
    and away_team.deleted_at is null
    and exists (
      select 1
      from public.teams as captain_team
      where captain_team.captain_profile_id = (select auth.uid())
        and captain_team.deleted_at is null
        and captain_team.id in (fixture.home_team_id, fixture.away_team_id)
    )
  order by fixture.starts_at;
$$;

revoke all on function public.get_my_published_fixtures() from public, anon, authenticated;
grant execute on function public.get_my_published_fixtures() to authenticated;

commit;

begin;

create or replace function public.get_public_published_fixtures()
returns table (
  id uuid,
  venue_name text,
  venue_address text,
  city text,
  home_team_name text,
  away_team_name text,
  round_name text,
  match_number integer,
  starts_at timestamptz,
  ends_at timestamptz,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    fixture.id,
    venue.name,
    venue.address,
    tournament_city.city,
    coalesce(home_team.member_name, home_team.name),
    coalesce(away_team.member_name, away_team.name),
    fixture.round_name,
    fixture.match_number,
    fixture.starts_at,
    fixture.ends_at,
    fixture.published_at
  from public.fixtures as fixture
  join public.venues as venue on venue.id = fixture.venue_id
  join public.tournament_cities as tournament_city on tournament_city.id = venue.tournament_city_id
  join public.teams as home_team on home_team.id = fixture.home_team_id
  join public.teams as away_team on away_team.id = fixture.away_team_id
  where fixture.status = 'published'
    and fixture.published_at <= pg_catalog.now()
    and fixture.ends_at >= pg_catalog.now()
    and fixture.deleted_at is null
    and venue.published
    and venue.deleted_at is null
    and tournament_city.deleted_at is null
    and home_team.deleted_at is null
    and away_team.deleted_at is null
  order by fixture.starts_at
  limit 6;
$$;

revoke all on function public.get_public_published_fixtures() from public, anon, authenticated;
grant execute on function public.get_public_published_fixtures() to anon, authenticated;

commit;

begin;

create or replace function public.save_venue(
  p_venue_id uuid,
  p_tournament_city_id uuid,
  p_name text,
  p_address text default null
)
returns public.venues
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_city public.tournament_cities%rowtype;
  existing_venue public.venues%rowtype;
  saved_venue public.venues%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;
  if pg_catalog.char_length(pg_catalog.btrim(p_name)) not between 2 and 160 then
    raise exception 'Enter a venue name between 2 and 160 characters.' using errcode = '22023';
  end if;
  if p_address is not null and pg_catalog.char_length(pg_catalog.btrim(p_address)) > 300 then
    raise exception 'Venue addresses cannot exceed 300 characters.' using errcode = '22023';
  end if;

  select * into target_city
  from public.tournament_cities
  where id = p_tournament_city_id and deleted_at is null;
  if not found then
    raise exception 'The selected tournament city is not available.' using errcode = '23503';
  end if;

  if p_venue_id is null then
    insert into public.venues (tournament_city_id, name, address, published)
    values (target_city.id, pg_catalog.btrim(p_name), nullif(pg_catalog.btrim(p_address), ''), false)
    returning * into saved_venue;
  else
    select * into existing_venue
    from public.venues
    where id = p_venue_id and deleted_at is null
    for update;
    if not found then
      return null;
    end if;
    if exists (
      select 1
      from public.fixtures as fixture
      where fixture.venue_id = existing_venue.id
        and fixture.deleted_at is null
        and fixture.tournament_id <> target_city.tournament_id
    ) then
      raise exception 'A venue with fixtures cannot move to a different tournament.' using errcode = '23514';
    end if;

    update public.venues
    set tournament_city_id = target_city.id,
        name = pg_catalog.btrim(p_name),
        address = nullif(pg_catalog.btrim(p_address), ''),
        updated_at = pg_catalog.now()
    where id = existing_venue.id
    returning * into saved_venue;
  end if;

  insert into public.audit_logs (actor_id, action, target_type, target_id, before_data, after_data)
  values (
    (select auth.uid()),
    case when p_venue_id is null then 'venue.created' else 'venue.updated' end,
    'venue',
    saved_venue.id,
    case when p_venue_id is null then null else pg_catalog.to_jsonb(existing_venue) end,
    pg_catalog.to_jsonb(saved_venue)
  );

  return saved_venue;
end;
$$;

create or replace function public.delete_fixture(p_fixture_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_fixture public.fixtures%rowtype;
  deleted_fixture public.fixtures%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;

  select * into existing_fixture
  from public.fixtures
  where id = p_fixture_id and deleted_at is null
  for update;
  if not found then
    return false;
  end if;

  update public.fixtures
  set deleted_at = pg_catalog.now(),
      updated_by = (select auth.uid()),
      updated_at = pg_catalog.now()
  where id = existing_fixture.id
  returning * into deleted_fixture;

  update public.announcements
  set published_at = null,
      deleted_at = pg_catalog.now(),
      updated_at = pg_catalog.now()
  where fixture_id = existing_fixture.id and deleted_at is null;

  insert into public.audit_logs (actor_id, action, target_type, target_id, before_data, after_data)
  values ((select auth.uid()), 'fixture.deleted', 'fixture', existing_fixture.id, pg_catalog.to_jsonb(existing_fixture), pg_catalog.to_jsonb(deleted_fixture));

  return true;
end;
$$;

create or replace function public.delete_venue(p_venue_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_venue public.venues%rowtype;
  deleted_venue public.venues%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;

  select * into existing_venue
  from public.venues
  where id = p_venue_id and deleted_at is null
  for update;
  if not found then
    return false;
  end if;
  if exists (select 1 from public.fixtures where venue_id = existing_venue.id and deleted_at is null) then
    raise exception 'Delete the fixtures using this venue first.' using errcode = '23503';
  end if;

  update public.venues
  set published = false,
      deleted_at = pg_catalog.now(),
      updated_at = pg_catalog.now()
  where id = existing_venue.id
  returning * into deleted_venue;

  insert into public.audit_logs (actor_id, action, target_type, target_id, before_data, after_data)
  values ((select auth.uid()), 'venue.deleted', 'venue', existing_venue.id, pg_catalog.to_jsonb(existing_venue), pg_catalog.to_jsonb(deleted_venue));

  return true;
end;
$$;

revoke all on function public.save_venue(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.delete_fixture(uuid) from public, anon, authenticated;
revoke all on function public.delete_venue(uuid) from public, anon, authenticated;
grant execute on function public.save_venue(uuid, uuid, text, text) to authenticated;
grant execute on function public.delete_fixture(uuid) to authenticated;
grant execute on function public.delete_venue(uuid) to authenticated;

commit;

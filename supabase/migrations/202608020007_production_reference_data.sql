begin;

-- Seed files are intended for local resets and are not applied by `supabase db
-- push`. Keep the production reference data in an idempotent migration so a
-- freshly linked project can provision captain invitations immediately.
insert into public.tournaments (
  id,
  name,
  edition,
  season_start,
  season_end,
  registration_fee_paise,
  winner_prize_paise,
  runner_up_prize_paise,
  published,
  settings
)
values (
  '50c00000-0000-4000-8000-000000000001',
  'One Dream Cup',
  '50th Special Edition',
  '2026-09-01',
  '2026-12-31',
  1450000,
  15000000,
  5000000,
  true,
  '{"format":"seven-over","minimum_guaranteed_matches":2,"ball_type":"tennis ball","finals_city":"Goa","qualifiers_per_city":2}'::jsonb
)
on conflict (name, edition) do update
set season_start = excluded.season_start,
    season_end = excluded.season_end,
    registration_fee_paise = excluded.registration_fee_paise,
    winner_prize_paise = excluded.winner_prize_paise,
    runner_up_prize_paise = excluded.runner_up_prize_paise,
    published = true,
    settings = excluded.settings,
    updated_at = pg_catalog.now(),
    deleted_at = null;

insert into public.tournament_cities (tournament_id, city)
select tournaments.id, cities.city
from public.tournaments
cross join (
  values ('Bangalore'), ('Chennai'), ('Hyderabad'), ('Pune')
) as cities(city)
where tournaments.name = 'One Dream Cup'
  and tournaments.edition = '50th Special Edition'
on conflict (tournament_id, city) do update
set updated_at = pg_catalog.now(),
    deleted_at = null;

insert into public.app_settings (key, value)
values
  ('contact', '{"whatsapp":"9591011861"}'::jsonb),
  (
    'public_disclosures',
    '{"exact_dates":null,"venues":null,"gst_treatment":null,"refund_terms":null,"squad_limits":null,"document_requirements":null,"payment_schedule":null}'::jsonb
  )
on conflict (key) do update
set value = excluded.value,
    updated_at = pg_catalog.now();

commit;

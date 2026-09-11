-- Safe, non-secret reference content. Auth users and roles are created separately.
insert into public.tournaments (
  id, name, edition, season_start, season_end,
  registration_fee_paise, winner_prize_paise, runner_up_prize_paise, published, settings
) values (
  '50c00000-0000-4000-8000-000000000001',
  'One Dream Cup', '50th Special Edition', '2026-09-01', '2026-12-31',
  1450000, 15000000, 5000000, true,
  '{"format":"seven-over","minimum_guaranteed_matches":2,"ball_type":"tennis ball","finals_city":"Goa","qualifiers_per_city":2}'::jsonb
) on conflict (id) do update set settings = excluded.settings, updated_at = now();

insert into public.tournament_cities (tournament_id, city)
select '50c00000-0000-4000-8000-000000000001', city
from unnest(array['Bangalore','Chennai','Hyderabad','Pune']) as city
on conflict (tournament_id, city) do nothing;

insert into public.app_settings (key, value) values
  ('contact', '{"whatsapp":"9591011861"}'::jsonb),
  ('public_disclosures', '{"exact_dates":null,"venues":null,"gst_treatment":null,"refund_terms":null,"squad_limits":null,"document_requirements":null,"payment_schedule":null}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

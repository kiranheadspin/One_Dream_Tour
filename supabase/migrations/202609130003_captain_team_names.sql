-- `name` remains the organizer's official team record. Captains can choose a
-- public-facing name without changing the company-derived administration label.
alter table public.teams add column if not exists member_name text;
alter table public.teams add constraint teams_member_name_length_check
  check (member_name is null or char_length(btrim(member_name)) between 2 and 120);

-- Preserve existing non-default names as the captain-facing choice, then make
-- the official label consistently "Company XI" for every existing team.
update public.teams as team
set member_name = team.name
from public.companies as company
where team.company_id = company.id
  and team.member_name is null
  and btrim(team.name) <> btrim(company.legal_name) || ' XI';

alter table public.teams drop constraint if exists teams_tournament_id_name_key;
update public.teams as team
set name = btrim(company.legal_name) || ' XI'
from public.companies as company
where team.company_id = company.id;

begin;

create policy companies_linked_captain_select
on public.companies
for select
to authenticated
using (
  exists (
    select 1
    from public.teams
    where teams.company_id = companies.id
      and teams.captain_profile_id = (select auth.uid())
      and teams.deleted_at is null
  )
);

commit;

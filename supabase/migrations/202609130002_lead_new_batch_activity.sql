-- A lead leaves the derived New batch as soon as an operator changes its
-- pipeline state, owner, or follow-up. Keep the update and the activity
-- evidence in one transaction so the queue cannot become stale.
create or replace function public.update_lead_with_activity(
  p_lead_id uuid,
  p_stage text default null,
  p_assigned_to uuid default null,
  p_next_follow_up_at timestamptz default null,
  p_update_stage boolean default false,
  p_update_assigned_to boolean default false,
  p_update_next_follow_up_at boolean default false
)
returns public.leads
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_lead public.leads%rowtype;
  updated_lead public.leads%rowtype;
  changes jsonb := '{}'::jsonb;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;

  select * into current_lead
  from public.leads
  where id = p_lead_id and deleted_at is null
  for update;

  if not found then
    return null;
  end if;

  if p_update_stage and p_stage is distinct from current_lead.stage then
    changes := changes || pg_catalog.jsonb_build_object('stage', pg_catalog.jsonb_build_object('from', current_lead.stage, 'to', p_stage));
  end if;
  if p_update_assigned_to and p_assigned_to is distinct from current_lead.assigned_to then
    changes := changes || pg_catalog.jsonb_build_object('assigned_to', true);
  end if;
  if p_update_next_follow_up_at and p_next_follow_up_at is distinct from current_lead.next_follow_up_at then
    changes := changes || pg_catalog.jsonb_build_object('next_follow_up_at', true);
  end if;

  update public.leads
  set
    stage = case when p_update_stage then p_stage else stage end,
    assigned_to = case when p_update_assigned_to then p_assigned_to else assigned_to end,
    next_follow_up_at = case when p_update_next_follow_up_at then p_next_follow_up_at else next_follow_up_at end,
    updated_at = case when changes <> '{}'::jsonb then pg_catalog.now() else updated_at end
  where id = current_lead.id
  returning * into updated_lead;

  if changes <> '{}'::jsonb then
    insert into public.lead_activities (lead_id, actor_id, kind, note, metadata)
    values (
      updated_lead.id,
      (select auth.uid()),
      'lead.updated',
      'Lead details updated by operations.',
      changes
    );
  end if;

  return updated_lead;
end;
$$;

revoke all on function public.update_lead_with_activity(uuid, text, uuid, timestamptz, boolean, boolean, boolean) from public, anon, authenticated;
grant execute on function public.update_lead_with_activity(uuid, text, uuid, timestamptz, boolean, boolean, boolean) to authenticated;

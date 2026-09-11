begin;

alter table public.payments
  add column if not exists submitted_at timestamptz,
  add column if not exists confirmed_at timestamptz,
  add column if not exists confirmed_by uuid references public.profiles(id) on delete restrict;

alter table public.payments drop constraint if exists payments_status_check;
alter table public.payments add constraint payments_status_check check (
  status in ('created','authorized','submitted','paid','failed','rejected','partially_refunded','refunded')
);

create index if not exists payments_manual_review_idx
  on public.payments (status, submitted_at desc)
  where provider = 'manual_upi' and status = 'submitted';

create or replace function public.confirm_manual_payment(p_payment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  payment_status text;
  registration_uuid uuid;
  team_uuid uuid;
  confirmed_timestamp timestamptz := now();
begin
  if not public.is_admin() then
    raise exception 'Administrator role required' using errcode = '42501';
  end if;

  select p.status, p.registration_id
  into payment_status, registration_uuid
  from public.payments p
  where p.id = p_payment_id and p.provider = 'manual_upi'
  for update;

  if not found then
    return false;
  end if;
  if payment_status = 'paid' then
    return true;
  end if;
  if payment_status <> 'submitted' then
    return false;
  end if;

  select r.team_id into team_uuid
  from public.registrations r
  where r.id = registration_uuid;
  if team_uuid is null then
    return false;
  end if;

  update public.payments
  set status = 'paid',
      confirmed_at = confirmed_timestamp,
      confirmed_by = (select auth.uid()),
      updated_at = confirmed_timestamp
  where id = p_payment_id;

  update public.registrations
  set confirmed_at = coalesce(confirmed_at, confirmed_timestamp),
      updated_at = confirmed_timestamp
  where id = registration_uuid;

  update public.teams
  set registration_status = 'Registered',
      updated_at = confirmed_timestamp
  where id = team_uuid;

  insert into public.audit_logs (actor_id, action, target_type, target_id, after_data)
  values (
    (select auth.uid()),
    'payment.confirmed_received',
    'payment',
    p_payment_id,
    jsonb_build_object('team_id', team_uuid, 'registration_id', registration_uuid)
  );

  return true;
end;
$$;

revoke all on function public.confirm_manual_payment(uuid) from public;
grant execute on function public.confirm_manual_payment(uuid) to authenticated;

commit;

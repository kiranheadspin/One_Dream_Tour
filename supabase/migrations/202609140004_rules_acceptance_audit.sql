-- Keep historical acceptance when captains review a newer rules version.
-- No existing acceptance is changed or treated as acceptance of the S50 rules.
create or replace function public.audit_team_rules_acceptance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.rules_version is distinct from new.rules_version
     or old.rules_accepted_at is distinct from new.rules_accepted_at then
    insert into public.audit_logs (actor_id, action, target_type, target_id, before_data, after_data)
    values (
      auth.uid(), 'rules.accepted', 'team', new.id,
      jsonb_build_object('version', old.rules_version, 'accepted_at', old.rules_accepted_at),
      jsonb_build_object('version', new.rules_version, 'accepted_at', new.rules_accepted_at)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.audit_team_rules_acceptance() from public, anon, authenticated;
create trigger audit_team_rules_acceptance
after update of rules_version, rules_accepted_at on public.teams
for each row execute function public.audit_team_rules_acceptance();

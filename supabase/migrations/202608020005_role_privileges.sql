begin;

-- RLS policies filter rows, while SQL privileges define which operations each
-- application role may attempt. Keep these grants explicit and least-privilege.
grant usage on schema public to anon, authenticated, service_role;

grant select on table
  public.tournaments,
  public.tournament_cities,
  public.venues,
  public.announcements,
  public.content_pages
to anon;

grant select on table
  public.profiles,
  public.profile_roles,
  public.companies,
  public.tournaments,
  public.tournament_cities,
  public.venues,
  public.campaigns,
  public.leads,
  public.lead_activities,
  public.follow_ups,
  public.teams,
  public.team_members,
  public.registrations,
  public.registration_steps,
  public.payments,
  public.payment_events,
  public.refunds,
  public.documents,
  public.consent_records,
  public.opportunities,
  public.announcements,
  public.audit_logs,
  public.app_settings,
  public.content_pages,
  public.campaign_sources,
  public.communication_preferences,
  public.marketing_interests,
  public.payment_attempts
to authenticated;

grant update on table public.profiles to authenticated;

grant insert, update, delete on table
  public.companies,
  public.tournaments,
  public.tournament_cities,
  public.venues,
  public.campaigns,
  public.leads,
  public.lead_activities,
  public.follow_ups,
  public.teams,
  public.team_members,
  public.registrations,
  public.registration_steps,
  public.payments,
  public.payment_events,
  public.refunds,
  public.opportunities,
  public.announcements,
  public.app_settings,
  public.content_pages,
  public.campaign_sources,
  public.communication_preferences,
  public.marketing_interests,
  public.payment_attempts
to authenticated;

grant insert on table public.consent_records to authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.profile_roles,
  public.companies,
  public.tournaments,
  public.tournament_cities,
  public.venues,
  public.campaigns,
  public.leads,
  public.lead_activities,
  public.follow_ups,
  public.teams,
  public.team_members,
  public.registrations,
  public.registration_steps,
  public.payments,
  public.payment_events,
  public.refunds,
  public.documents,
  public.consent_records,
  public.opportunities,
  public.announcements,
  public.audit_logs,
  public.app_settings,
  public.content_pages,
  public.campaign_sources,
  public.communication_preferences,
  public.marketing_interests,
  public.payment_attempts
to service_role;

commit;

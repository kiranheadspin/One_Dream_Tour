import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(path.join(process.cwd(), "supabase/migrations/202608020001_one_dream_cup.sql"), "utf8");
const retentionMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202608020002_retention_and_attribution.sql"), "utf8");
const manualUpiMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202608020003_manual_upi_review.sql"), "utf8");
const productionMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202608020004_production_hardening.sql"), "utf8");
const privilegeMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202608020005_role_privileges.sql"), "utf8");
const captainInvitationMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202608020006_captain_invitations.sql"), "utf8");
const productionReferenceDataMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202608020007_production_reference_data.sql"), "utf8");
const captainUpsertFixMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202608020008_fix_captain_registration_upsert.sql"), "utf8");
const passwordAccessMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202609120001_password_access.sql"), "utf8");
const captainCompanyAccessMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202609120002_captain_company_access.sql"), "utf8");
const leadNewBatchMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202609130002_lead_new_batch_activity.sql"), "utf8");
const fixturePublishingMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202609140001_fixture_publishing.sql"), "utf8");
const scheduleEditDeleteMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202609140002_schedule_edit_delete.sql"), "utf8");
const publicFixtureMigration = readFileSync(path.join(process.cwd(), "supabase/migrations/202609140003_public_fixture_announcements.sql"), "utf8");

describe("database security migration", () => {
  it.each(["leads", "teams", "team_members", "payments", "payment_events", "consent_records", "audit_logs"])("enables RLS for %s", (table) => {
    expect(migration).toContain(`alter table public.${table} enable row level security;`);
  });

  it("binds captain access to the authenticated profile", () => {
    expect(migration).toContain("captain_profile_id = (select auth.uid())");
  });

  it("makes security event tables append-only for application roles", () => {
    expect(migration).toContain("revoke update, delete on public.consent_records from anon, authenticated;");
    expect(migration).toContain("revoke update, delete on public.payment_events from anon, authenticated;");
    expect(migration).toContain("revoke update, delete on public.audit_logs from anon, authenticated;");
  });

  it("allows captains to append only their own profile-level marketing consent", () => {
    expect(retentionMigration).toContain("profile_id = (select auth.uid()) and lead_id is null and purpose = 'marketing'");
  });

  it("requires an administrator and locks the payment row before manual confirmation", () => {
    expect(manualUpiMigration).toContain("if not public.is_admin() then");
    expect(manualUpiMigration).toContain("for update;");
    expect(manualUpiMigration).toContain("status = 'paid'");
  });

  it("keeps shared rate-limit data private and callable only by the service role", () => {
    expect(productionMigration).toContain("alter table public.request_rate_limits enable row level security;");
    expect(productionMigration).toContain("grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;");
  });

  it("commits a lead and both consent records through one service-only function", () => {
    expect(productionMigration).toContain("create or replace function public.submit_public_lead(");
    expect(productionMigration).toContain("on conflict (lower(email), city) where deleted_at is null do nothing");
    expect(productionMigration).toContain("'operations', true");
    expect(productionMigration).toContain("'marketing', coalesce");
    expect(productionMigration).toContain("grant execute on function public.submit_public_lead(jsonb, text, text, text) to service_role;");
  });

  it("creates profiles for invited Auth users without assigning a role", () => {
    expect(productionMigration).toContain("create trigger on_auth_user_created");
    expect(productionMigration).toContain("insert into public.profiles");
    expect(productionMigration).not.toContain("insert into public.profile_roles");
  });

  it("pairs RLS with explicit least-privilege application grants", () => {
    expect(privilegeMigration).toContain("grant usage on schema public to anon, authenticated, service_role;");
    expect(privilegeMigration).toContain("public.profile_roles");
    expect(privilegeMigration).toContain("to service_role;");
    expect(privilegeMigration).toContain("grant insert on table public.consent_records to authenticated;");
    expect(privilegeMigration).not.toContain("grant all");
  });

  it("provisions captain registration through a locked service-only transaction", () => {
    expect(captainInvitationMigration).toContain("create or replace function public.provision_captain_invitation(");
    expect(captainInvitationMigration).toContain("pg_catalog.pg_advisory_xact_lock");
    expect(captainInvitationMigration).toContain("on conflict (profile_id, role) do nothing");
    expect(captainInvitationMigration).toContain("on conflict on constraint registrations_team_id_key do update");
    expect(captainInvitationMigration).toContain("revoke all on function public.provision_captain_invitation");
    expect(captainInvitationMigration).toContain("grant execute on function public.provision_captain_invitation(uuid, uuid, text, text, uuid) to service_role;");
    expect(captainInvitationMigration).not.toContain("grant execute on function public.provision_captain_invitation(uuid, uuid, text, text, uuid) to authenticated;");
  });

  it("publishes the production tournament and restores its supported cities", () => {
    expect(productionReferenceDataMigration).toContain("on conflict (name, edition) do update");
    expect(productionReferenceDataMigration).toContain("published = true");
    expect(productionReferenceDataMigration).toContain("('Bangalore'), ('Chennai'), ('Hyderabad'), ('Pune')");
    expect(productionReferenceDataMigration).toContain("on conflict (tournament_id, city) do update");
  });

  it("targets the registration uniqueness constraint without a PL/pgSQL name conflict", () => {
    expect(captainInvitationMigration).toContain("on conflict on constraint registrations_team_id_key do update");
    expect(captainUpsertFixMigration).toContain("on conflict on constraint registrations_team_id_key do update");
    expect(captainUpsertFixMigration).toContain("revoke all on function public.provision_captain_invitation");
  });

  it("keeps captain activation tokens private and stores only fixed-length hashes", () => {
    expect(passwordAccessMigration).toContain("token_hash text not null unique check (char_length(token_hash) = 64)");
    expect(passwordAccessMigration).toContain("alter table public.captain_activation_tokens enable row level security;");
    expect(passwordAccessMigration).toContain("revoke all on table public.captain_activation_tokens from public, anon, authenticated;");
    expect(passwordAccessMigration).toContain("grant all on table public.captain_activation_tokens to service_role;");
  });

  it("enforces unique normalized captain usernames and removes email preferences", () => {
    expect(passwordAccessMigration).toContain("on public.profiles (lower(username))");
    expect(passwordAccessMigration).toContain("delete from public.communication_preferences where channel = 'email';");
    expect(passwordAccessMigration).toContain("check (channel in ('whatsapp', 'phone'))");
    expect(passwordAccessMigration).toContain("revoke update on table public.profiles from authenticated;");
    expect(passwordAccessMigration).toContain("grant update (full_name, phone, updated_at) on table public.profiles to authenticated;");
  });

  it("uses the captain profile foreign key explicitly for activation lookups", () => {
    const captainAccess = readFileSync(path.join(process.cwd(), "src/lib/captain-access.ts"), "utf8");
    expect(captainAccess).toContain(
      "profiles!captain_activation_tokens_profile_id_fkey(username,full_name)",
    );
  });

  it("issues strong direct credentials for new captain access without persisting a plaintext password", () => {
    const captainAccess = readFileSync(path.join(process.cwd(), "src/lib/captain-access.ts"), "utf8");
    expect(captainAccess).toContain('const GENERATED_PASSWORD_LENGTH = 20;');
    expect(captainAccess).toContain('randomCharacter(LOWERCASE_LETTERS)');
    expect(captainAccess).toContain('randomCharacter(UPPERCASE_LETTERS)');
    expect(captainAccess).toContain('randomCharacter(DIGITS)');
    expect(captainAccess).toContain('const password = generateCaptainPassword();');
    expect(captainAccess).toContain('`Password: ${password}`');
    expect(captainAccess).not.toContain('password: password,');
  });

  it("lets captains read only the company linked to their active team", () => {
    expect(captainCompanyAccessMigration).toContain("create policy companies_linked_captain_select");
    expect(captainCompanyAccessMigration).toContain("teams.company_id = companies.id");
    expect(captainCompanyAccessMigration).toContain("teams.captain_profile_id = (select auth.uid())");
    expect(captainCompanyAccessMigration).toContain("teams.deleted_at is null");
  });

  it("records an administrator's lead update as an atomic interaction", () => {
    expect(leadNewBatchMigration).toContain("create or replace function public.update_lead_with_activity(");
    expect(leadNewBatchMigration).toContain("for update;");
    expect(leadNewBatchMigration).toContain("insert into public.lead_activities");
    expect(leadNewBatchMigration).toContain("grant execute on function public.update_lead_with_activity");
  });

  it("publishes fixtures atomically and prevents venue or team overlaps", () => {
    expect(fixturePublishingMigration).toContain("alter table public.fixtures enable row level security;");
    expect(fixturePublishingMigration).toContain("perform pg_catalog.pg_advisory_xact_lock");
    expect(fixturePublishingMigration).toContain("fixture.starts_at < p_ends_at");
    expect(fixturePublishingMigration).toContain("fixture.ends_at > p_starts_at");
    expect(fixturePublishingMigration).toContain("on conflict (fixture_id) do update");
    expect(fixturePublishingMigration).toContain("insert into public.audit_logs");
  });

  it("returns only the signed-in captain's published fixtures without widening team RLS", () => {
    expect(fixturePublishingMigration).toContain("create or replace function public.get_my_published_fixtures()");
    expect(fixturePublishingMigration).toContain("captain_team.captain_profile_id = (select auth.uid())");
    expect(fixturePublishingMigration).toContain("captain_team.id in (fixture.home_team_id, fixture.away_team_id)");
    expect(fixturePublishingMigration).toContain("grant execute on function public.get_my_published_fixtures() to authenticated;");
  });

  it("edits and soft-deletes schedule data through audited administrator functions", () => {
    expect(scheduleEditDeleteMigration).toContain("create or replace function public.save_venue(");
    expect(scheduleEditDeleteMigration).toContain("create or replace function public.delete_fixture(");
    expect(scheduleEditDeleteMigration).toContain("create or replace function public.delete_venue(");
    expect(scheduleEditDeleteMigration).toContain("raise exception 'Delete the fixtures using this venue first.'");
    expect(scheduleEditDeleteMigration).toContain("set published_at = null,");
    expect(scheduleEditDeleteMigration).toContain("'fixture.deleted'");
    expect(scheduleEditDeleteMigration).toContain("'venue.deleted'");
  });

  it("exposes only safe upcoming published fixture fields to the public", () => {
    expect(publicFixtureMigration).toContain("create or replace function public.get_public_published_fixtures()");
    expect(publicFixtureMigration).toContain("fixture.status = 'published'");
    expect(publicFixtureMigration).toContain("fixture.ends_at >= pg_catalog.now()");
    expect(publicFixtureMigration).toContain("fixture.deleted_at is null");
    expect(publicFixtureMigration).toContain("grant execute on function public.get_public_published_fixtures() to anon, authenticated;");
    expect(publicFixtureMigration).not.toContain("notes");
    const returnedColumns = publicFixtureMigration.match(/returns table \(([\s\S]*?)\)\nlanguage sql/)?.[1] ?? "";
    expect(returnedColumns).not.toContain("team_id");
  });
});

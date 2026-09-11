import "server-only";

import type { User } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

interface CaptainInvitationResult {
  teamId: string;
  registrationId: string;
  newlyProvisioned: boolean;
  emailSent: boolean;
}

interface InvitationLead {
  id: string;
  captain_name: string;
  email: string;
  stage: string;
}

async function findAuthUserByEmail(email: string): Promise<User | null> {
  const supabase = createSupabaseAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);
    if (user) return user;
    if (data.users.length < 1000) return null;
  }

  throw new Error("Captain lookup exceeded the supported user count.");
}

async function getOrCreateCaptainUser(lead: InvitationLead) {
  const supabase = createSupabaseAdminClient();
  const existingUser = await findAuthUserByEmail(lead.email);
  if (existingUser) return { user: existingUser, created: false };

  const { data, error } = await supabase.auth.admin.createUser({
    email: lead.email.trim().toLowerCase(),
    email_confirm: true,
    user_metadata: { full_name: lead.captain_name },
    app_metadata: { invited_by: "one-dream-cup-admin" },
  });

  if (!error && data.user) return { user: data.user, created: true };

  // A concurrent invitation may have created the same Auth user between the
  // lookup and create calls. Re-read once before surfacing the provider error.
  const concurrentUser = await findAuthUserByEmail(lead.email);
  if (concurrentUser) return { user: concurrentUser, created: false };
  throw error ?? new Error("Captain Auth account could not be created.");
}

export async function inviteCaptainFromLead({
  leadId,
  teamName,
  actorId,
}: {
  leadId: string;
  teamName: string;
  actorId: string;
}): Promise<CaptainInvitationResult> {
  const supabase = createSupabaseAdminClient();
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id,captain_name,email,stage")
    .eq("id", leadId)
    .is("deleted_at", null)
    .single();

  if (leadError || !lead) throw leadError ?? new Error("Lead not found.");

  const captain = await getOrCreateCaptainUser(lead as InvitationLead);
  const { data: existingRoles, error: roleLookupError } = await supabase
    .from("profile_roles")
    .select("role")
    .eq("profile_id", captain.user.id);

  if (roleLookupError) {
    if (captain.created) await supabase.auth.admin.deleteUser(captain.user.id);
    throw roleLookupError;
  }
  if (existingRoles?.some((row) => row.role === "admin")) {
    if (captain.created) await supabase.auth.admin.deleteUser(captain.user.id);
    throw new Error("An administrator email cannot be invited as a captain.");
  }

  const { data: provisionRows, error: provisionError } = await supabase.rpc("provision_captain_invitation", {
    p_lead_id: leadId,
    p_captain_profile_id: captain.user.id,
    p_captain_name: lead.captain_name,
    p_team_name: teamName,
    p_actor_id: actorId,
  });

  if (provisionError) {
    if (captain.created) await supabase.auth.admin.deleteUser(captain.user.id);
    throw provisionError;
  }

  const provision = Array.isArray(provisionRows) ? provisionRows[0] : provisionRows;
  if (!provision?.team_id || !provision?.registration_id) {
    if (captain.created) await supabase.auth.admin.deleteUser(captain.user.id);
    throw new Error("Captain registration provisioning returned no result.");
  }

  const callbackUrl = new URL("/auth/callback", env.NEXT_PUBLIC_SITE_URL);
  callbackUrl.searchParams.set("next", "/dashboard");
  const { error: emailError } = await supabase.auth.signInWithOtp({
    email: lead.email.trim().toLowerCase(),
    options: {
      emailRedirectTo: callbackUrl.toString(),
      shouldCreateUser: false,
    },
  });

  return {
    teamId: String(provision.team_id),
    registrationId: String(provision.registration_id),
    newlyProvisioned: Boolean(provision.newly_provisioned),
    emailSent: !emailError,
  };
}

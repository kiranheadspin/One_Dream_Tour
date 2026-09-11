import "server-only";

import { createHash, randomBytes, randomInt } from "node:crypto";
import type { User } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const ACTIVATION_LIFETIME_MS = 48 * 60 * 60 * 1000;

export interface CaptainAccessResult {
  teamId: string;
  registrationId: string;
  newlyProvisioned: boolean;
  username: string;
  activationUrl: string;
  whatsappUrl: string;
  expiresAt: string;
}

interface AccessLead {
  id: string;
  captain_name: string;
  email: string;
  whatsapp: string;
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function usernameStem(name: string) {
  const stem = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "")
    .slice(0, 22);
  return /^[a-z]/.test(stem) && stem.length >= 3 ? stem : "captain";
}

async function createUniqueUsername(name: string) {
  const supabase = createSupabaseAdminClient();
  const stem = usernameStem(name);
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = `${stem}.${randomInt(1000, 10000)}`;
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", candidate)
      .is("deleted_at", null)
      .limit(1);
    if (error) throw error;
    if (!data.length) return candidate;
  }
  throw new Error("A unique captain username could not be generated.");
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

async function findCaptainForLead(leadId: string): Promise<User | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("teams!inner(captain_profile_id)")
    .eq("lead_id", leadId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  const teams = data?.teams;
  const team = Array.isArray(teams) ? teams[0] : teams;
  if (!team?.captain_profile_id) return null;
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(team.captain_profile_id);
  if (userError) throw userError;
  return userData.user;
}

async function getOrCreateCaptainUser(lead: AccessLead, username: string) {
  const supabase = createSupabaseAdminClient();
  const linkedUser = await findCaptainForLead(lead.id);
  const legacyUser = linkedUser ?? await findAuthUserByEmail(lead.email);
  if (legacyUser) return { user: legacyUser, created: false };

  const password = randomBytes(32).toString("base64url");
  const { data, error } = await supabase.auth.admin.createUser({
    email: `${username}@captain.auth.invalid`,
    password,
    email_confirm: true,
    user_metadata: { full_name: lead.captain_name },
    app_metadata: { provisioned_by: "one-dream-cup-admin" },
  });
  if (error || !data.user) throw error ?? new Error("Captain account could not be created.");
  return { user: data.user, created: true };
}

export async function createCaptainAccess({
  leadId,
  teamName,
  actorId,
}: {
  leadId: string;
  teamName: string;
  actorId: string;
}): Promise<CaptainAccessResult> {
  const supabase = createSupabaseAdminClient();
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id,captain_name,email,whatsapp")
    .eq("id", leadId)
    .is("deleted_at", null)
    .single();
  if (leadError || !lead) throw leadError ?? new Error("Lead not found.");

  const linkedUser = await findCaptainForLead(leadId);
  let username: string | null = null;
  if (linkedUser) {
    const { data: profile, error } = await supabase.from("profiles").select("username").eq("id", linkedUser.id).single();
    if (error) throw error;
    username = profile.username;
  }
  username ??= await createUniqueUsername(lead.captain_name);

  const captain = await getOrCreateCaptainUser(lead as AccessLead, username);
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
    throw new Error("An administrator account cannot be assigned to a captain.");
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

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ username, updated_at: new Date().toISOString() })
    .eq("id", captain.user.id);
  if (profileError) throw profileError;

  await supabase
    .from("captain_activation_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("profile_id", captain.user.id)
    .is("used_at", null);

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ACTIVATION_LIFETIME_MS).toISOString();
  const { error: tokenError } = await supabase.from("captain_activation_tokens").insert({
    profile_id: captain.user.id,
    token_hash: tokenHash(token),
    expires_at: expiresAt,
    created_by: actorId,
  });
  if (tokenError) throw tokenError;

  const activationUrl = new URL(`/activate/${token}`, env.NEXT_PUBLIC_SITE_URL).toString();
  const message = [
    `Hello ${lead.captain_name},`,
    "Your One Dream Cup captain access is ready.",
    `Username: ${username}`,
    `Create your password: ${activationUrl}`,
    "This private link expires in 48 hours and can be used once.",
  ].join("\n\n");
  const whatsappUrl = `https://wa.me/${lead.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  return {
    teamId: String(provision.team_id),
    registrationId: String(provision.registration_id),
    newlyProvisioned: Boolean(provision.newly_provisioned),
    username,
    activationUrl,
    whatsappUrl,
    expiresAt,
  };
}

export async function getCaptainActivation(token: string) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("captain_activation_tokens")
    .select("id,expires_at,used_at,profiles!inner(username,full_name)")
    .eq("token_hash", tokenHash(token))
    .maybeSingle();
  if (error || !data || data.used_at || new Date(data.expires_at) <= new Date()) return null;
  const profiles = data.profiles;
  const profile = Array.isArray(profiles) ? profiles[0] : profiles;
  if (!profile?.username) return null;
  return { username: profile.username, fullName: profile.full_name, expiresAt: data.expires_at };
}

export async function activateCaptain(token: string, password: string) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return false;
  const supabase = createSupabaseAdminClient();
  const claimedAt = new Date().toISOString();
  const { data: claimed, error: claimError } = await supabase
    .from("captain_activation_tokens")
    .update({ used_at: claimedAt })
    .eq("token_hash", tokenHash(token))
    .is("used_at", null)
    .gt("expires_at", claimedAt)
    .select("id,profile_id")
    .maybeSingle();
  if (claimError || !claimed) return false;

  const { error: passwordError } = await supabase.auth.admin.updateUserById(claimed.profile_id, { password });
  if (passwordError) {
    await supabase.from("captain_activation_tokens").update({ used_at: null }).eq("id", claimed.id).eq("used_at", claimedAt);
    throw passwordError;
  }
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ captain_activated_at: claimedAt, updated_at: claimedAt })
    .eq("id", claimed.profile_id);
  if (profileError) console.error("Captain password was set but activation status could not be recorded.");
  return true;
}

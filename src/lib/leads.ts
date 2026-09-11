import "server-only";
import type { Lead } from "@/lib/types";
import type { LeadInput } from "@/lib/validation";
import { isDemoMode } from "@/lib/env";
import { createDemoLead, readDemoDatabase, updateDemoLead } from "@/lib/demo-store";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { LeadStage } from "@/lib/constants";

const fromRow = (row: Record<string, unknown>): Lead => ({
  id: String(row.id), reference: String(row.reference), captainName: String(row.captain_name), displayName: String(row.display_name),
  phone: String(row.phone), whatsapp: String(row.whatsapp), email: String(row.email), company: String(row.company_name),
  relationship: String(row.relationship_to_company), city: row.city as Lead["city"], teamSize: String(row.approximate_team_size),
  preferredMonth: String(row.preferred_month), companyApproval: String(row.company_approval), source: String(row.source),
  campaign: row.source_campaign ? String(row.source_campaign) : undefined,
  utmSource: row.utm_source ? String(row.utm_source) : undefined, utmMedium: row.utm_medium ? String(row.utm_medium) : undefined,
  utmCampaign: row.utm_campaign ? String(row.utm_campaign) : undefined, utmTerm: row.utm_term ? String(row.utm_term) : undefined,
  utmContent: row.utm_content ? String(row.utm_content) : undefined, referralCode: row.referral_code ? String(row.referral_code) : undefined,
  landingPage: row.landing_page ? String(row.landing_page) : undefined, referrer: row.referrer ? String(row.referrer) : undefined,
  futureInterests: (row.future_interests as string[] | null) ?? [], message: row.message ? String(row.message) : undefined,
  stage: row.stage as LeadStage, marketingConsent: false, operationalConsent: true,
  assignedTo: row.assigned_to ? String(row.assigned_to) : undefined,
  nextFollowUp: row.next_follow_up_at ? String(row.next_follow_up_at) : undefined,
  createdAt: String(row.created_at), updatedAt: String(row.updated_at),
});

export interface LeadRequestEvidence {
  ipHash?: string | null;
  userAgentHash?: string | null;
}

export async function createLead(input: LeadInput, evidence: LeadRequestEvidence = {}) {
  if (isDemoMode) return createDemoLead(input);
  const supabase = createSupabaseAdminClient();
  const { data: submissionRows, error: submissionError } = await supabase.rpc("submit_public_lead", {
    p_input: input,
    p_policy_version: "2026-08-01",
    p_ip_hash: evidence.ipHash ?? null,
    p_user_agent_hash: evidence.userAgentHash ?? null,
  });
  if (submissionError) throw submissionError;
  const submission = Array.isArray(submissionRows) ? submissionRows[0] : submissionRows;
  if (!submission?.lead_id) throw new Error("Lead submission did not return a record.");

  const { data: row, error } = await supabase.from("leads").select("*").eq("id", submission.lead_id).single();
  if (error || !row) throw error ?? new Error("Lead submission could not be loaded.");
  const lead = fromRow(row);
  if (!submission.duplicate) lead.marketingConsent = input.marketingConsent;
  return { lead, duplicate: submission.duplicate };
}

export async function listLeads() {
  if (isDemoMode) return (await readDemoDatabase()).leads;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("leads").select("*").is("deleted_at", null).order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  const leads = data.map(fromRow);
  if (!leads.length) return leads;

  const leadIds = leads.map((lead) => lead.id);
  const [{ data: consentRows, error: consentError }, { data: registrationRows, error: registrationError }] = await Promise.all([
    supabase
      .from("consent_records")
      .select("lead_id,purpose,granted,created_at")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("registrations")
      .select("lead_id")
      .in("lead_id", leadIds)
      .is("deleted_at", null),
  ]);
  if (consentError) throw consentError;
  if (registrationError) throw registrationError;

  const latestConsent = new Map<string, { operations?: boolean; marketing?: boolean }>();
  for (const record of consentRows) {
    if (!record.lead_id) continue;
    const current = latestConsent.get(record.lead_id) ?? {};
    if (record.purpose === "operations" && current.operations === undefined) current.operations = record.granted;
    if (record.purpose === "marketing" && current.marketing === undefined) current.marketing = record.granted;
    latestConsent.set(record.lead_id, current);
  }
  const provisionedLeadIds = new Set(registrationRows.map((registration) => registration.lead_id).filter(Boolean));

  return leads.map((lead) => ({
    ...lead,
    captainProvisioned: provisionedLeadIds.has(lead.id),
    operationalConsent: latestConsent.get(lead.id)?.operations ?? false,
    marketingConsent: latestConsent.get(lead.id)?.marketing ?? false,
  }));
}

export async function updateLead(id: string, update: { stage?: LeadStage; assignedTo?: string; nextFollowUp?: string }) {
  if (isDemoMode) return updateDemoLead(id, update);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("leads").update({ stage: update.stage, assigned_to: update.assignedTo || null, next_follow_up_at: update.nextFollowUp || null, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
  if (error) throw error;
  return fromRow(data);
}

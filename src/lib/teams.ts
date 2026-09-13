import "server-only";
import { isDemoMode } from "@/lib/env";
import { readDemoDatabase } from "@/lib/demo-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Team } from "@/lib/types";

export async function getCaptainTeamOrNull(profileId: string): Promise<Team | null> {
  if (isDemoMode) return (await readDemoDatabase()).teams[0];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("teams").select("id,name,registration_status,rules_accepted_at,updated_at,companies!inner(legal_name),tournament_cities!inner(city),profiles!teams_captain_profile_id_fkey(full_name),team_members(id,full_name,email,phone,employee_id,epfo_number,is_captain),registrations(payments(status))").eq("captain_profile_id", profileId).is("deleted_at", null).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const company = Array.isArray(data.companies) ? data.companies[0] : data.companies;
  const city = Array.isArray(data.tournament_cities) ? data.tournament_cities[0] : data.tournament_cities;
  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  const registration = Array.isArray(data.registrations) ? data.registrations[0] : data.registrations;
  const payments = registration?.payments ?? [];
  return {
    id: data.id, name: data.name, company: company?.legal_name ?? "", city: city?.city as Team["city"], captainName: profile?.full_name ?? "",
    captainEmail: "", registrationStatus: data.registration_status as Team["registrationStatus"], rulesAcceptedAt: data.rules_accepted_at ?? undefined,
    paymentStatus: payments.some((payment) => payment.status === "paid") ? "Paid" : "Not started",
    players: (data.team_members ?? []).map((member) => ({ id: member.id, name: member.full_name, email: member.email, phone: member.phone, employeeId: member.employee_id, epfoNumber: member.epfo_number ?? "", isCaptain: member.is_captain })),
    updatedAt: data.updated_at,
  };
}

export async function getCaptainTeam(profileId: string): Promise<Team> {
  const team = await getCaptainTeamOrNull(profileId);
  if (!team) throw new Error("Captain team registration is not linked.");
  return team;
}

export async function getLatestPaidPaymentReference(teamId: string): Promise<string | null> {
  if (isDemoMode) {
    const database = await readDemoDatabase();
    const payment = database.payments
      .filter((item) => item.teamId === teamId && item.status === "paid")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    return payment?.providerPaymentId ?? payment?.orderId ?? null;
  }

  const supabase = await createSupabaseServerClient();
  const { data: registration, error: registrationError } = await supabase
    .from("registrations")
    .select("id")
    .eq("team_id", teamId)
    .limit(1)
    .maybeSingle();
  if (registrationError) throw registrationError;
  if (!registration) return null;

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("provider_payment_id,provider_order_id")
    .eq("registration_id", registration.id)
    .eq("status", "paid")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (paymentError) throw paymentError;
  return payment?.provider_payment_id ?? payment?.provider_order_id ?? null;
}

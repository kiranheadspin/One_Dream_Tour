import "server-only";
import { isDemoMode } from "@/lib/env";
import { readDemoDatabase } from "@/lib/demo-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CaptainPaymentView } from "@/lib/types";

function mapDemoPayment(payment: Awaited<ReturnType<typeof readDemoDatabase>>["payments"][number]): CaptainPaymentView {
  return {
    id: payment.id,
    reference: payment.orderId,
    transactionReference: payment.providerPaymentId,
    amountPaise: payment.amountPaise,
    provider: payment.provider ?? "razorpay",
    status: payment.status,
    submittedAt: payment.submittedAt,
    updatedAt: payment.updatedAt,
  };
}

export async function getCaptainPaymentHistory(teamId: string): Promise<CaptainPaymentView[]> {
  if (isDemoMode) {
    const database = await readDemoDatabase();
    return database.payments
      .filter((payment) => payment.teamId === teamId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(mapDemoPayment);
  }

  const supabase = await createSupabaseServerClient();
  const { data: registration, error: registrationError } = await supabase
    .from("registrations")
    .select("id")
    .eq("team_id", teamId)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();
  if (registrationError) throw registrationError;
  if (!registration) return [];

  const { data, error } = await supabase
    .from("payments")
    .select("id,provider,provider_order_id,provider_payment_id,amount_paise,status,submitted_at,updated_at")
    .eq("registration_id", registration.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return data.map((payment) => ({
    id: payment.id,
    reference: payment.provider_order_id,
    transactionReference: payment.provider_payment_id ?? undefined,
    amountPaise: payment.amount_paise,
    provider: payment.provider,
    status: payment.status as CaptainPaymentView["status"],
    submittedAt: payment.submitted_at ?? undefined,
    updatedAt: payment.updated_at,
  }));
}

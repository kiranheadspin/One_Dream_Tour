import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { hasAcceptedCurrentRules } from "@/lib/tournament-rules";
import { readDemoDatabase } from "@/lib/demo-store";
import { TOURNAMENT } from "@/lib/constants";
import { isDemoMode, upiPaymentConfig } from "@/lib/env";
import { submitDemoUpiPayment } from "@/lib/demo-store";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const submissionSchema = z.object({
  transactionReference: z.string().trim().max(100).regex(/^[a-zA-Z0-9\s._/-]*$/).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "captain") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey || idempotencyKey.length > 100) {
    return NextResponse.json({ error: "A valid idempotency key is required." }, { status: 422 });
  }
  const parsed = submissionSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid UPI transaction reference." }, { status: 422 });
  }
  const transactionReference = parsed.data.transactionReference || undefined;

  if (isDemoMode) {
    if (!hasAcceptedCurrentRules((await readDemoDatabase()).teams[0])) return NextResponse.json({ error: "Accept the current rules version first." }, { status: 409 });
    const payment = await submitDemoUpiPayment(idempotencyKey, transactionReference);
    return NextResponse.json({ payment });
  }
  if (!upiPaymentConfig.configured) {
    return NextResponse.json({ error: "UPI payment details are not configured." }, { status: 409 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: team } = await supabase
    .from("teams")
    .select("id,rules_accepted_at,rules_version,registrations(id)")
    .eq("captain_profile_id", session.userId)
    .is("deleted_at", null)
    .limit(1)
    .single();
  if (!team || !hasAcceptedCurrentRules({ rulesAcceptedAt: team.rules_accepted_at ?? undefined, rulesVersion: team.rules_version ?? undefined })) {
    return NextResponse.json({ error: "Accept the current rules version first." }, { status: 409 });
  }

  const registrationRows = team.registrations;
  const registration = Array.isArray(registrationRows) ? registrationRows[0] : registrationRows;
  if (!registration) {
    return NextResponse.json({ error: "Registration invitation not found." }, { status: 404 });
  }
  const { data: settings } = await supabase.from("app_settings").select("value").eq("key", "payments_enabled").maybeSingle();
  if (settings?.value !== true) {
    return NextResponse.json({ error: "Payment is not enabled until the organizer publishes the commercial terms." }, { status: 409 });
  }

  const { data: idempotentPayment } = await supabase.from("payments").select("*").eq("idempotency_key", idempotencyKey).maybeSingle();
  if (idempotentPayment) return NextResponse.json({ payment: idempotentPayment });

  const { data: activePayment } = await supabase
    .from("payments")
    .select("*")
    .eq("registration_id", registration.id)
    .eq("provider", "manual_upi")
    .in("status", ["submitted", "paid"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (activePayment) return NextResponse.json({ payment: activePayment });

  const timestamp = new Date().toISOString();
  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      registration_id: registration.id,
      provider: "manual_upi",
      provider_order_id: `upi_${randomUUID()}`,
      provider_payment_id: transactionReference,
      amount_paise: TOURNAMENT.feePaise,
      status: "submitted",
      idempotency_key: idempotencyKey,
      submitted_at: timestamp,
    })
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: "The payment review request could not be recorded." }, { status: 409 });
  }

  await Promise.all([
    supabase.from("teams").update({ registration_status: "Payment pending", updated_at: timestamp }).eq("id", team.id),
    supabase.from("audit_logs").insert({
      actor_id: session.userId,
      action: "payment.submitted_for_review",
      target_type: "payment",
      target_id: payment.id,
      after_data: { team_id: team.id, provider_order_id: payment.provider_order_id },
    }),
  ]);
  return NextResponse.json({ payment });
}

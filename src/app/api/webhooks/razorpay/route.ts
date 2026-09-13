import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { razorpayProvider } from "@/lib/payments";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (isDemoMode) return NextResponse.json({ ok: true, demo: true });

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const eventId = request.headers.get("x-razorpay-event-id") ?? "";
  if (!eventId || !razorpayProvider.verifyWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("payment_events").select("id").eq("provider_event_id", eventId).maybeSingle();
  if (existing) return NextResponse.json({ ok: true, duplicate: true });

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const type = String(payload.event ?? "unknown");
  const entity = ((payload.payload as Record<string, unknown> | undefined)?.payment as Record<string, unknown> | undefined)?.entity as Record<string, unknown> | undefined;
  const orderId = entity?.order_id ? String(entity.order_id) : null;
  const paymentId = entity?.id ? String(entity.id) : null;
  const { data: payment } = orderId
    ? await supabase.from("payments").select("id,registration_id").eq("provider_order_id", orderId).maybeSingle()
    : { data: null };
  const { error } = await supabase.from("payment_events").insert({ payment_id: payment?.id ?? null, provider_event_id: eventId, event_type: type, signature_verified: true, payload });
  if (error) return NextResponse.json({ error: "Event could not be recorded." }, { status: 409 });

  if (payment && paymentId && type === "payment.captured") {
    const timestamp = new Date().toISOString();
    const { error: paymentError } = await supabase.from("payments").update({ provider_payment_id: paymentId, status: "paid", updated_at: timestamp }).eq("id", payment.id);
    if (paymentError) return NextResponse.json({ error: "Payment could not be recorded." }, { status: 409 });

    const { data: registration, error: registrationError } = await supabase.from("registrations").select("team_id").eq("id", payment.registration_id).maybeSingle();
    if (registrationError || !registration) return NextResponse.json({ error: "Registration could not be resolved." }, { status: 409 });

    const { error: teamError } = await supabase.from("teams").update({ registration_status: "Registered", updated_at: timestamp }).eq("id", registration.team_id);
    if (teamError) return NextResponse.json({ error: "Team registration could not be completed." }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { razorpayProvider } from "@/lib/payments";

export const runtime = "nodejs";
const schema = z.object({ orderId: z.string().min(1), paymentId: z.string().min(1), signature: z.string().min(16) });
type RegistrationJoin = { team_id: string; teams: { captain_profile_id: string } | { captain_profile_id: string }[] };

export async function POST(request: Request) {
  if (isDemoMode) return NextResponse.json({ error: "Use mock confirmation in demo mode." }, { status: 400 });
  const session = await getSession();
  if (!session || session.role !== "captain") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid verification payload." }, { status: 422 });
  if (!razorpayProvider.verifyPayment(parsed.data)) return NextResponse.json({ error: "Payment signature is invalid." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: payment } = await supabase.from("payments").select("id,registration_id,registrations!inner(team_id,teams!inner(captain_profile_id))").eq("provider_order_id", parsed.data.orderId).single();
  const joined = payment?.registrations as unknown as RegistrationJoin | RegistrationJoin[] | undefined;
  const registration = Array.isArray(joined) ? joined[0] : joined;
  const joinedTeam = registration?.teams;
  const team = Array.isArray(joinedTeam) ? joinedTeam[0] : joinedTeam;
  if (!payment || !registration || team?.captain_profile_id !== session.userId) return NextResponse.json({ error: "Payment not found." }, { status: 404 });

  const { error } = await supabase.from("payments").update({ provider_payment_id: parsed.data.paymentId, status: "paid", updated_at: new Date().toISOString() }).eq("id", payment.id).eq("status", "created");
  if (error) return NextResponse.json({ error: "Payment could not be recorded." }, { status: 409 });
  await supabase.from("teams").update({ registration_status: "Registered" }).eq("id", registration.team_id);
  return NextResponse.json({ ok: true });
}

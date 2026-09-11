import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { confirmDemoUpiPayment } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid payment." }, { status: 422 });
  }

  if (isDemoMode) {
    const payment = await confirmDemoUpiPayment(id, session.userId);
    if (!payment) return NextResponse.json({ error: "Payment is not awaiting confirmation." }, { status: 409 });
    return NextResponse.json({ payment });
  }

  const supabase = await createSupabaseServerClient();
  const { data: confirmed, error } = await supabase.rpc("confirm_manual_payment", { p_payment_id: id });
  if (error) {
    return NextResponse.json({ error: "Payment confirmation could not be completed." }, { status: 409 });
  }
  if (!confirmed) {
    return NextResponse.json({ error: "Payment is not awaiting confirmation." }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}

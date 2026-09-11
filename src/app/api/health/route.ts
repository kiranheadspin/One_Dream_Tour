import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDemoMode) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("app_settings").select("key").limit(1);
    if (error) {
      return NextResponse.json(
        { status: "unavailable" },
        { status: 503, headers: { "cache-control": "no-store", "retry-after": "30" } },
      );
    }
  }
  return NextResponse.json({ status: "ok" }, { headers: { "cache-control": "no-store" } });
}

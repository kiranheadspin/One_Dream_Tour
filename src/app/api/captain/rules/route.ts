import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { acceptDemoRules } from "@/lib/demo-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RULES_VERSION } from "@/lib/tournament-rules";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "captain") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (body?.version !== RULES_VERSION || body?.accepted !== true) return NextResponse.json({ error: "Reload the rules page and accept the displayed version." }, { status: 409 });
  if (isDemoMode) return NextResponse.json({ team: await acceptDemoRules() });
  const supabase = await createSupabaseServerClient();
  const { data: team, error: readError } = await supabase.from("teams").select("id,rules_version,rules_accepted_at").eq("captain_profile_id", session.userId).is("deleted_at", null).single();
  if (readError || !team) return NextResponse.json({ error: "Team could not be loaded." }, { status: 404 });
  if (team.rules_version === RULES_VERSION && team.rules_accepted_at) return NextResponse.json({ ok: true });
  let update = supabase.from("teams").update({ rules_accepted_at: new Date().toISOString(), rules_version: RULES_VERSION }).eq("id", team.id).eq("captain_profile_id", session.userId).is("deleted_at", null);
  // Compare both previous values to preserve timestamps across concurrent requests.
  update = team.rules_version === null ? update.is("rules_version", null) : update.eq("rules_version", team.rules_version);
  update = team.rules_accepted_at === null ? update.is("rules_accepted_at", null) : update.eq("rules_accepted_at", team.rules_accepted_at);
  const { data, error } = await update.select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "Acceptance could not be recorded." }, { status: 400 });
  if (!data) return NextResponse.json({ error: "This record changed. Reload the rules page." }, { status: 409 });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateDemoTeamName } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { captainTeamNameSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "captain") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = captainTeamNameSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Enter a valid team name." }, { status: 422 });

  if (isDemoMode) {
    const team = await updateDemoTeamName(parsed.data.teamName);
    return NextResponse.json({ teamName: team.name });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teams")
    .update({ member_name: parsed.data.teamName, updated_at: new Date().toISOString() })
    .eq("captain_profile_id", session.userId)
    .is("deleted_at", null)
    .select("member_name")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Team name could not be saved." }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Team not found." }, { status: 404 });
  return NextResponse.json({ teamName: data.member_name });
}

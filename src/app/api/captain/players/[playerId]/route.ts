import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteDemoPlayer, updateDemoPlayer } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { playerSchema } from "@/lib/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ playerId: string }> };

async function captainTeamId(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("captain_profile_id", userId)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();
  return { supabase, teamId: team?.id };
}

export async function PATCH(request: Request, context: Context) {
  const session = await getSession();
  if (!session || session.role !== "captain") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = playerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the player details.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  const { playerId } = await context.params;

  if (isDemoMode) {
    const player = await updateDemoPlayer(playerId, parsed.data);
    return player ? NextResponse.json({ player }) : NextResponse.json({ error: "Player not found or cannot be changed." }, { status: 404 });
  }

  const { supabase, teamId } = await captainTeamId(session.userId);
  if (!teamId) return NextResponse.json({ error: "Team not found." }, { status: 404 });
  const { data, error } = await supabase
    .from("team_members")
    .update({ full_name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, employee_id: parsed.data.employeeId, epfo_number: parsed.data.epfoNumber })
    .eq("id", playerId)
    .eq("team_id", teamId)
    .eq("is_captain", false)
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Player could not be updated." }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Player not found or cannot be changed." }, { status: 404 });
  return NextResponse.json({ player: data });
}

export async function DELETE(_request: Request, context: Context) {
  const session = await getSession();
  if (!session || session.role !== "captain") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { playerId } = await context.params;

  if (isDemoMode) {
    const deleted = await deleteDemoPlayer(playerId);
    return deleted ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Player not found or cannot be removed." }, { status: 404 });
  }

  const { supabase, teamId } = await captainTeamId(session.userId);
  if (!teamId) return NextResponse.json({ error: "Team not found." }, { status: 404 });
  const { data, error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", playerId)
    .eq("team_id", teamId)
    .eq("is_captain", false)
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Player could not be removed." }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Player not found or cannot be removed." }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}

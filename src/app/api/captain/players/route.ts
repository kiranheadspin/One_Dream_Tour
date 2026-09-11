import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { playerSchema } from "@/lib/validation";
import { addDemoPlayer } from "@/lib/demo-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request:Request){const session=await getSession();if(!session||session.role!=="captain")return NextResponse.json({error:"Unauthorized"},{status:401});const parsed=playerSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Check the player details.",fields:parsed.error.flatten().fieldErrors},{status:422});if(isDemoMode){const player=await addDemoPlayer(parsed.data);return NextResponse.json({player},{status:201});}const supabase=await createSupabaseServerClient();const {data:team}=await supabase.from("teams").select("id").eq("captain_profile_id",session.userId).is("deleted_at",null).single();if(!team)return NextResponse.json({error:"Team not found."},{status:404});const {data,error}=await supabase.from("team_members").insert({team_id:team.id,full_name:parsed.data.name,email:parsed.data.email,phone:parsed.data.phone,employee_id:parsed.data.employeeId,shirt_size:parsed.data.shirtSize}).select("id").single();if(error)return NextResponse.json({error:"Player could not be added."},{status:400});return NextResponse.json({player:data},{status:201});}

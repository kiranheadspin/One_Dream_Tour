import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { acceptDemoRules } from "@/lib/demo-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(){const session=await getSession();if(!session||session.role!=="captain")return NextResponse.json({error:"Unauthorized"},{status:401});if(isDemoMode)return NextResponse.json({team:await acceptDemoRules()});const supabase=await createSupabaseServerClient();const {error}=await supabase.from("teams").update({rules_accepted_at:new Date().toISOString(),rules_version:"2026-draft"}).eq("captain_profile_id",session.userId);if(error)return NextResponse.json({error:"Acceptance could not be recorded."},{status:400});return NextResponse.json({ok:true});}

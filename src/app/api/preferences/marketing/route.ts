import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { setDemoMarketingConsent } from "@/lib/demo-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request:Request){const session=await getSession();if(!session||session.role!=="captain")return NextResponse.json({error:"Unauthorized"},{status:401});const parsed=z.object({granted:z.boolean()}).safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid preference."},{status:422});if(isDemoMode){await setDemoMarketingConsent(parsed.data.granted);return NextResponse.json({ok:true});}const supabase=await createSupabaseServerClient();const timestamp=new Date().toISOString();const {error:consentError}=await supabase.from("consent_records").insert({profile_id:session.userId,purpose:"marketing",granted:parsed.data.granted,policy_version:"2026-08-01",source:"captain-preferences"});if(consentError)return NextResponse.json({error:"Preference could not be recorded."},{status:400});const {error}=await supabase.from("communication_preferences").upsert({profile_id:session.userId,channel:"whatsapp",marketing_enabled:parsed.data.granted,updated_at:timestamp},{onConflict:"profile_id,channel"});if(error)return NextResponse.json({error:"Preference could not be saved."},{status:400});return NextResponse.json({ok:true});}

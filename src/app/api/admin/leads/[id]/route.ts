import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { leadUpdateSchema } from "@/lib/validation";
import { updateLead } from "@/lib/leads";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){const session=await getSession();if(!session||session.role!=="admin")return NextResponse.json({error:"Unauthorized"},{status:401});const parsed=leadUpdateSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid update.",fields:parsed.error.flatten().fieldErrors},{status:422});const {id}=await params;const lead=await updateLead(id,parsed.data,session.userId);if(!lead)return NextResponse.json({error:"Lead not found."},{status:404});return NextResponse.json({lead});}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { completeDemoPayment } from "@/lib/demo-store";

export async function POST(request:Request){if(!isDemoMode)return NextResponse.json({error:"Not found"},{status:404});const session=await getSession();if(!session||session.role!=="captain")return NextResponse.json({error:"Unauthorized"},{status:401});const parsed=z.object({paymentId:z.uuid()}).safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid payment."},{status:422});const payment=await completeDemoPayment(parsed.data.paymentId);if(!payment)return NextResponse.json({error:"Payment not found."},{status:404});return NextResponse.json({payment});}

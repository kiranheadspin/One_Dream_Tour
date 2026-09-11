import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env, isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (isDemoMode) (await cookies()).delete("odc_demo_session");
  else await (await createSupabaseServerClient()).auth.signOut();
  const response = NextResponse.redirect(new URL("/login", isDemoMode ? request.url : env.NEXT_PUBLIC_SITE_URL), 303);
  response.headers.set("cache-control", "private, no-store");
  return response;
}

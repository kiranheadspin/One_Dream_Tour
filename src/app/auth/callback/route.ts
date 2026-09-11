import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthCallbackParams } from "@/lib/auth-callback";
import { destinationForRole } from "@/lib/auth-redirects";
import type { AppRole } from "@/lib/auth";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirect = (path: string) => {
    const response = NextResponse.redirect(new URL(path, env.NEXT_PUBLIC_SITE_URL));
    response.headers.set("cache-control", "private, no-store");
    return response;
  };
  const authParams = getAuthCallbackParams(url);
  if (!authParams) {
    const hashCallbackUrl = new URL("/auth/hash-callback", env.NEXT_PUBLIC_SITE_URL);
    const requestedPath = url.searchParams.get("next");
    if (requestedPath) hashCallbackUrl.searchParams.set("next", requestedPath);
    const response = NextResponse.redirect(hashCallbackUrl);
    response.headers.set("cache-control", "private, no-store");
    return response;
  }
  const supabase = await createSupabaseServerClient();
  const { error } = authParams.method === "code"
    ? await supabase.auth.exchangeCodeForSession(authParams.code)
    : await supabase.auth.verifyOtp({ token_hash: authParams.tokenHash, type: authParams.type });
  if (error) return redirect("/login?error=invalid-link");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login?error=invalid-link");

  const { data: roleRows, error: roleError } = await supabase
    .from("profile_roles")
    .select("role")
    .eq("profile_id", user.id)
    .in("role", ["admin", "captain"]);
  if (roleError) {
    await supabase.auth.signOut();
    return redirect("/login?error=temporarily-unavailable");
  }
  const roles = new Set((roleRows ?? []).map((row) => row.role as AppRole));
  const requestedPath = authParams.next;
  const role: AppRole | null = roles.has("admin") ? "admin" : roles.has("captain") ? "captain" : null;
  if (!role) {
    await supabase.auth.signOut();
    return redirect("/login?error=not-authorized");
  }

  return redirect(destinationForRole(role, requestedPath));
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/env";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import { destinationForRole } from "@/lib/auth-redirects";
import type { AppRole } from "@/lib/auth";

const credentialsSchema = z.object({
  identifier: z.string().trim().min(5).max(180),
  password: z.string().min(8).max(200),
  next: z.string().max(500).optional(),
});

async function emailForIdentifier(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  if (normalized.includes("@")) return normalized;
  const admin = createSupabaseAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id")
    .ilike("username", normalized)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !profile) return null;
  const { data, error: userError } = await admin.auth.admin.getUserById(profile.id);
  if (userError) return null;
  return data.user.email ?? null;
}

export async function POST(request: Request) {
  if (isDemoMode) return NextResponse.json({ error: "Use a demo role button." }, { status: 400 });
  const parsed = credentialsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your username or admin email and password." }, { status: 422 });
  const identifier = parsed.data.identifier.trim().toLowerCase();
  const clientAddress = getClientAddress(request.headers);
  try {
    const [addressRate, identityRate] = await Promise.all([
      checkRateLimit(`login-address:${clientAddress}`, 10),
      checkRateLimit(`login-identity:${identifier}`, 5),
    ]);
    const retryAfterSeconds = Math.max(addressRate.retryAfterSeconds, identityRate.retryAfterSeconds);
    if (!addressRate.allowed || !identityRate.allowed) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Please wait and try again." },
        { status: 429, headers: { "retry-after": String(retryAfterSeconds), "cache-control": "no-store" } },
      );
    }
  } catch {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503, headers: { "retry-after": "60" } });
  }

  const email = await emailForIdentifier(identifier);
  if (!email) return NextResponse.json({ error: "The username/email or password is incorrect." }, { status: 401, headers: { "cache-control": "no-store" } });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });
  if (error || !data.user) return NextResponse.json({ error: "The username/email or password is incorrect." }, { status: 401, headers: { "cache-control": "no-store" } });

  const { data: roleRows, error: roleError } = await supabase
    .from("profile_roles")
    .select("role")
    .eq("profile_id", data.user.id)
    .in("role", ["admin", "captain"]);
  if (roleError) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503, headers: { "cache-control": "no-store" } });
  }
  const roles = new Set((roleRows ?? []).map((row) => row.role as AppRole));
  const role: AppRole | null = roles.has("admin") ? "admin" : roles.has("captain") ? "captain" : null;
  if (!role) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "This account does not have dashboard access." }, { status: 403, headers: { "cache-control": "no-store" } });
  }
  return NextResponse.json({ redirectTo: destinationForRole(role, parsed.data.next) }, { headers: { "cache-control": "no-store" } });
}

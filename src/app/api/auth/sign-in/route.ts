import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode, env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import { safeRelativePath } from "@/lib/auth-redirects";

export async function POST(request: Request) {
  if (isDemoMode) return NextResponse.json({ error: "Use a demo role button." }, { status: 400 });
  const parsed = z.object({ email: z.email().max(180), next: z.string().max(500).optional() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email." }, { status: 422 });
  const email = parsed.data.email.trim().toLowerCase();
  const clientAddress = getClientAddress(request.headers);
  try {
    const [addressRate, emailRate] = await Promise.all([
      checkRateLimit(`login-address:${clientAddress}`, 10),
      checkRateLimit(`login-email:${email}`, 3),
    ]);
    const retryAfterSeconds = Math.max(addressRate.retryAfterSeconds, emailRate.retryAfterSeconds);
    if (!addressRate.allowed || !emailRate.allowed) {
      return NextResponse.json(
        { error: "Please wait before requesting another link." },
        { status: 429, headers: { "retry-after": String(retryAfterSeconds), "cache-control": "no-store" } },
      );
    }
  } catch {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503, headers: { "retry-after": "60" } });
  }

  const callbackUrl = new URL("/auth/callback", env.NEXT_PUBLIC_SITE_URL);
  const nextPath = safeRelativePath(parsed.data.next);
  if (nextPath) callbackUrl.searchParams.set("next", nextPath);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callbackUrl.toString(), shouldCreateUser: false },
  });
  if (error) console.error(`Supabase OTP request failed with status ${error.status ?? "unknown"}.`);
  return NextResponse.json({ message: "If this email has access, a secure sign-in link is on its way." }, { headers: { "cache-control": "no-store" } });
}

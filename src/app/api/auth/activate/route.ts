import { NextResponse } from "next/server";
import { z } from "zod";
import { activateCaptain } from "@/lib/captain-access";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/env";

const activationSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{40,60}$/),
  password: z.string()
    .min(10, "Use at least 10 characters.")
    .max(200)
    .regex(/[a-z]/, "Add a lowercase letter.")
    .regex(/[A-Z]/, "Add an uppercase letter.")
    .regex(/\d/, "Add a number."),
});

export async function POST(request: Request) {
  if (isDemoMode) return NextResponse.json({ error: "Activation is unavailable in demo mode." }, { status: 409 });
  const parsed = activationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your activation details." }, { status: 422 });
  }
  try {
    const rate = await checkRateLimit(`activation:${getClientAddress(request.headers)}`, 8);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many activation attempts. Please wait and try again." }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
    }
    const activated = await activateCaptain(parsed.data.token, parsed.data.password);
    if (!activated) return NextResponse.json({ error: "This activation link is invalid, expired, or already used." }, { status: 410 });
    return NextResponse.json({ message: "Password created. You can now sign in with your captain username." }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Captain access could not be activated. Ask the organizer for a new link." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/env";

export async function POST(request: Request) {
  if (!isDemoMode) return NextResponse.json({ error: "Demo access is disabled." }, { status: 404 });
  const body = await request.json().catch(() => null) as { role?: string } | null;
  if (!body?.role || !["admin", "captain"].includes(body.role)) return NextResponse.json({ error: "Invalid role." }, { status: 422 });
  (await cookies()).set("odc_demo_session", body.role, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 8 * 60 * 60, path: "/" });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete("odc_demo_session");
  return NextResponse.json({ ok: true });
}

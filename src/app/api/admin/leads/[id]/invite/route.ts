import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createCaptainAccess } from "@/lib/captain-access";
import { isDemoMode } from "@/lib/env";
import { captainInvitationSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isDemoMode) {
    return NextResponse.json({ error: "Live captain access is disabled in demo mode." }, { status: 409 });
  }

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid lead." }, { status: 422 });
  }

  const parsed = captainInvitationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the invitation details." },
      { status: 422 },
    );
  }

  try {
    const access = await createCaptainAccess({
      leadId: id,
      teamName: parsed.data.teamName,
      actorId: session.userId,
    });

    return NextResponse.json(
      {
        message: access.newlyProvisioned
          ? "Captain access created. Share the one-time link on WhatsApp."
          : "A new one-time activation link was created.",
        ...access,
      },
      { status: access.newlyProvisioned ? 201 : 200, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Captain invitation failed.";
    const isConflict = message.includes("administrator account") || message.includes("duplicate key");
    console.error("Captain access creation failed.");
    return NextResponse.json(
      { error: isConflict ? message : "Captain access could not be created. Check the team details and try again." },
      { status: isConflict ? 409 : 500 },
    );
  }
}

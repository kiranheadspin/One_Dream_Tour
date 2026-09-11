import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { inviteCaptainFromLead } from "@/lib/captain-invitations";
import { isDemoMode } from "@/lib/env";
import { captainInvitationSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isDemoMode) {
    return NextResponse.json({ error: "Captain invitations are disabled in demo mode." }, { status: 409 });
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
    const invitation = await inviteCaptainFromLead({
      leadId: id,
      teamName: parsed.data.teamName,
      actorId: session.userId,
    });

    if (!invitation.emailSent) {
      return NextResponse.json(
        {
          error: "Captain access was created, but the email could not be sent. Verify the sender domain and retry.",
          provisioned: true,
          teamId: invitation.teamId,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        message: invitation.newlyProvisioned
          ? "Captain access created and sign-in link sent."
          : "Captain sign-in link sent again.",
        teamId: invitation.teamId,
        newlyProvisioned: invitation.newlyProvisioned,
      },
      { status: invitation.newlyProvisioned ? 201 : 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Captain invitation failed.";
    const isConflict = message.includes("administrator email") || message.includes("duplicate key");
    console.error("Captain invitation failed.");
    return NextResponse.json(
      { error: isConflict ? message : "Captain access could not be created. Check the team details and try again." },
      { status: isConflict ? 409 : 500 },
    );
  }
}

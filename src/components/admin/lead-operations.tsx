"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface LeadOperationsProps {
  id: string;
  captainEmail: string;
  companyName: string;
  registrationInvited: boolean;
  assignedTo?: string;
  nextFollowUp?: string;
}

export function LeadOperations({
  id,
  captainEmail,
  companyName,
  registrationInvited,
  assignedTo,
  nextFollowUp,
}: LeadOperationsProps) {
  const router = useRouter();
  const [owner, setOwner] = useState(assignedTo ?? "");
  const [followUp, setFollowUp] = useState(nextFollowUp?.slice(0, 16) ?? "");
  const [teamName, setTeamName] = useState(`${companyName} XI`);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [invitationMessage, setInvitationMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(registrationInvited);

  async function saveFollowUp() {
    setSaving(true);
    setFollowUpMessage("");
    const response = await fetch(`/api/admin/leads/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        assignedTo: owner,
        nextFollowUp: followUp ? new Date(followUp).toISOString() : "",
      }),
    });
    setSaving(false);
    setFollowUpMessage(response.ok ? "Follow-up saved." : "Update failed.");
    if (response.ok) router.refresh();
  }

  async function inviteCaptain() {
    setInviting(true);
    setInvitationMessage("");
    const response = await fetch(`/api/admin/leads/${encodeURIComponent(id)}/invite`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ teamName }),
    });
    const result = (await response.json().catch(() => null)) as { message?: string; error?: string; provisioned?: boolean } | null;
    setInviting(false);
    setInvitationMessage(result?.message ?? result?.error ?? "Captain invitation failed.");
    if (response.ok || result?.provisioned) {
      setInvited(true);
      router.refresh();
    }
  }

  return (
    <div className="border bg-white p-6">
      <h2 className="text-xl text-[#081326]">Owner & follow-up</h2>
      <div className="mt-5 grid gap-4">
        <Field>
          <FieldLabel htmlFor="owner">Assigned to</FieldLabel>
          <Input id="owner" value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Operations owner" className="h-10" />
        </Field>
        <Field>
          <FieldLabel htmlFor="follow-up">Next follow-up</FieldLabel>
          <Input id="follow-up" type="datetime-local" value={followUp} onChange={(event) => setFollowUp(event.target.value)} className="h-10" />
        </Field>
        <Button disabled={saving} onClick={saveFollowUp} variant="outline">
          {saving ? "Saving…" : "Save follow-up"}
        </Button>
        {followUpMessage ? <p aria-live="polite" className="text-xs text-slate-500">{followUpMessage}</p> : null}
      </div>

      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-semibold text-[#081326]">Captain invitation</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create captain access, prepare the team registration, and email a secure sign-in link.
        </p>
        <div className="mt-4 grid gap-4">
          <Field>
            <FieldLabel htmlFor="team-name">Team name</FieldLabel>
            <Input id="team-name" value={teamName} onChange={(event) => setTeamName(event.target.value)} maxLength={120} className="h-10" />
            <FieldDescription>The invitation will be sent to {captainEmail}.</FieldDescription>
          </Field>
          <Button disabled={inviting || teamName.trim().length < 2} onClick={inviteCaptain} className="bg-[#313999] text-white">
            {inviting ? "Sending invitation…" : invited ? "Resend captain invitation" : "Invite captain"}
          </Button>
          {invitationMessage ? <p role="status" aria-live="polite" className="text-xs leading-5 text-slate-600">{invitationMessage}</p> : null}
        </div>
      </div>
    </div>
  );
}

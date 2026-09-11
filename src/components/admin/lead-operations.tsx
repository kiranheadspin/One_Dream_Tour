"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface LeadOperationsProps {
  id: string;
  captainWhatsapp: string;
  companyName: string;
  registrationInvited: boolean;
  assignedTo?: string;
  nextFollowUp?: string;
}

export function LeadOperations({
  id,
  captainWhatsapp,
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
  const [access, setAccess] = useState<{ username: string; activationUrl: string; whatsappUrl: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

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
    const result = (await response.json().catch(() => null)) as { message?: string; error?: string; username?: string; activationUrl?: string; whatsappUrl?: string; expiresAt?: string } | null;
    setInviting(false);
    setInvitationMessage(result?.message ?? result?.error ?? "Captain invitation failed.");
    if (response.ok && result?.username && result.activationUrl && result.whatsappUrl && result.expiresAt) {
      setInvited(true);
      setAccess({ username: result.username, activationUrl: result.activationUrl, whatsappUrl: result.whatsappUrl, expiresAt: result.expiresAt });
      router.refresh();
    }
  }

  async function copyAccess() {
    if (!access) return;
    await navigator.clipboard.writeText(`Username: ${access.username}\nCreate password: ${access.activationUrl}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
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
        <h3 className="text-lg font-semibold text-[#081326]">Captain access</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Generate a captain username and one-time activation link, then share it through WhatsApp.
        </p>
        <div className="mt-4 grid gap-4">
          <Field>
            <FieldLabel htmlFor="team-name">Team name</FieldLabel>
            <Input id="team-name" value={teamName} onChange={(event) => setTeamName(event.target.value)} maxLength={120} className="h-10" />
            <FieldDescription>The WhatsApp message will be prepared for {captainWhatsapp}.</FieldDescription>
          </Field>
          <Button disabled={inviting || teamName.trim().length < 2} onClick={inviteCaptain} className="bg-[#313999] text-white">
            {inviting ? "Generating access…" : invited ? "Create new activation link" : "Create captain access"}
          </Button>
          {invitationMessage ? <p role="status" aria-live="polite" className="text-xs leading-5 text-slate-600">{invitationMessage}</p> : null}
          {access ? <Alert><AlertTitle>Private access details</AlertTitle><AlertDescription><p>Username: <span className="font-mono font-semibold text-foreground">{access.username}</span></p><p className="mt-1">Link expires {new Date(access.expiresAt).toLocaleString("en-IN")}.</p><div className="mt-4 flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={copyAccess}>{copied ? <Check data-icon="inline-start"/> : <Copy data-icon="inline-start"/>}{copied ? "Copied" : "Copy details"}</Button><Button render={<a href={access.whatsappUrl} target="_blank" rel="noreferrer"/>} size="sm" className="bg-[#1f8f55] text-white"><MessageCircle data-icon="inline-start"/>Open WhatsApp</Button></div></AlertDescription></Alert> : null}
        </div>
      </div>
    </div>
  );
}

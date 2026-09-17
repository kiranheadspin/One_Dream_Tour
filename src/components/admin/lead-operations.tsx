"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
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
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [invitationMessage, setInvitationMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(registrationInvited);
  const [access, setAccess] = useState<{ loginUrl: string; whatsappUrl: string } | null>(null);
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
      body: JSON.stringify({}),
    });
    const result = (await response.json().catch(() => null)) as { message?: string; error?: string; loginUrl?: string; whatsappUrl?: string } | null;
    setInviting(false);
    setInvitationMessage(result?.message ?? result?.error ?? "Captain invitation failed.");
    if (response.ok && result?.loginUrl && result.whatsappUrl) {
      setInvited(true);
      setAccess({ loginUrl: result.loginUrl, whatsappUrl: result.whatsappUrl });
      router.refresh();
    }
  }

  async function copyAccess() {
    if (!access) return;
    await navigator.clipboard.writeText(access.loginUrl);
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
          Generate a private captain login link, then share it through WhatsApp.
        </p>
        <div className="mt-4 grid gap-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-medium text-[#081326]">Official team record: {companyName} XI</p>
            <p className="mt-1">The captain can select a team name after activating their access. Their choice appears here as a subname.</p>
          </div>
          <p className="text-xs text-slate-500">The WhatsApp message will be prepared for {captainWhatsapp}.</p>
          <Button disabled={inviting} onClick={inviteCaptain} className="bg-[#313999] text-white">
            {inviting ? "Generating credentials…" : invited ? "Generate new password" : "Create captain access"}
          </Button>
          {invitationMessage ? <p role="status" aria-live="polite" className="text-xs leading-5 text-slate-600">{invitationMessage}</p> : null}
          {access ? <Alert><AlertTitle>Private login link</AlertTitle><AlertDescription><p className="text-sm">The link contains the captain’s username and password. Generating another password immediately replaces it.</p><div className="mt-4 flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={copyAccess}>{copied ? <Check data-icon="inline-start"/> : <Copy data-icon="inline-start"/>}{copied ? "Copied" : "Copy login link"}</Button><Button render={<a href={access.whatsappUrl} target="_blank" rel="noreferrer"/>} size="sm" className="bg-[#1f8f55] text-white"><MessageCircle data-icon="inline-start"/>Open WhatsApp</Button></div></AlertDescription></Alert> : null}
        </div>
      </div>
    </div>
  );
}

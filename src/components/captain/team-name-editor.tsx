"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function TeamNameEditor({ initialName, officialName }: { initialName: string; officialName: string }) {
  const router = useRouter();
  const [teamName, setTeamName] = useState(initialName === officialName ? "" : initialName);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/captain/team-name", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ teamName }) });
    const result = await response.json().catch(() => null) as { error?: string } | null;
    setSaving(false);
    setMessage(response.ok ? "Team name saved." : result?.error ?? "Team name could not be saved.");
    if (response.ok) router.refresh();
  }

  return <div className="border bg-white p-5 sm:p-6">
    <h2 className="text-xl text-[#081326]">Your team name</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">Choose the name your team uses. It will appear as the main name across your captain dashboard.</p>
    <Field className="mt-5">
      <FieldLabel htmlFor="captain-team-name">Team name</FieldLabel>
      <Input id="captain-team-name" value={teamName} onChange={(event) => setTeamName(event.target.value)} maxLength={120} placeholder="e.g. Northstar Strikers" />
      <FieldDescription>Official organizer record: {officialName}</FieldDescription>
    </Field>
    <div className="mt-4 flex items-center gap-3"><Button disabled={saving || teamName.trim().length < 2} onClick={save}>{saving ? "Saving…" : "Save team name"}</Button>{message ? <p role="status" className="text-sm text-slate-600">{message}</p> : null}</div>
  </div>;
}

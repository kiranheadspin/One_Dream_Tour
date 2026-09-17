"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { hasAcceptedCurrentRules, RULES_VERSION } from "@/lib/tournament-rules";

export function RulesAcceptance({ acceptedAt, acceptedVersion }: { acceptedAt?: string; acceptedVersion?: string }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (hasAcceptedCurrentRules({ rulesAcceptedAt: acceptedAt, rulesVersion: acceptedVersion })) return <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Rules version {acceptedVersion} accepted on {new Date(acceptedAt!).toLocaleString("en-IN")}.</div>;

  async function accept() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/captain/rules", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ version: RULES_VERSION, accepted: true }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Acceptance could not be recorded."); return; }
      router.refresh();
    } catch { setError("Acceptance could not be recorded. Check your connection and try again."); }
    finally { setLoading(false); }
  }

  return <div className="grid gap-4">
    {acceptedAt && <p className="text-sm text-amber-800">Previous acceptance: {acceptedVersion ?? "unversioned record"}, {new Date(acceptedAt).toLocaleString("en-IN")}. Please review this updated version.</p>}
    <label className="flex items-start gap-3 text-sm leading-6"><Checkbox checked={checked} onCheckedChange={(value) => setChecked(value === true)} className="mt-1" />I have reviewed and accept rules version {RULES_VERSION}. I understand that the listed unresolved details require a separate organiser announcement.</label>
    <Button className="h-10 w-fit bg-[#313999] text-white" disabled={!checked || loading} onClick={accept}>{loading ? "Recording…" : "Record acceptance"}</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}

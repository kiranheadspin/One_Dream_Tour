"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function CaptainActivationForm({ token, username }: { token: string; username: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function activate(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmation) return setMessage("The passwords do not match.");
    setLoading(true); setMessage("");
    const response = await fetch("/api/auth/activate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const result = await response.json() as { message?: string; error?: string };
    setLoading(false);
    if (!response.ok) return setMessage(result.error ?? "Activation failed.");
    setComplete(true); setMessage(result.message ?? "Password created.");
  }

  if (complete) {
    return <Alert><CheckCircle2/><AlertTitle>Captain access activated</AlertTitle><AlertDescription><p>{message}</p><Button render={<Link href="/login"/>} className="mt-4 bg-[#313999] text-white">Continue to sign in</Button></AlertDescription></Alert>;
  }

  return <form onSubmit={activate}><FieldGroup><Alert><KeyRound/><AlertTitle>Your captain username</AlertTitle><AlertDescription><span className="font-mono font-semibold text-foreground">{username}</span></AlertDescription></Alert><Field><FieldLabel htmlFor="new-password">Create password</FieldLabel><Input id="new-password" type="password" autoComplete="new-password" minLength={10} required value={password} onChange={(event)=>setPassword(event.target.value)}/><FieldDescription>Use at least 10 characters with uppercase, lowercase, and a number.</FieldDescription></Field><Field><FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel><Input id="confirm-password" type="password" autoComplete="new-password" minLength={10} required value={confirmation} onChange={(event)=>setConfirmation(event.target.value)}/></Field><Button type="submit" disabled={loading} className="bg-[#313999] text-white">{loading ? "Activating…" : "Activate captain access"}</Button>{message ? <FieldError aria-live="polite">{message}</FieldError> : null}</FieldGroup></form>;
}

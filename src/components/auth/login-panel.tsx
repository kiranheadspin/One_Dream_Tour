"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { showNavigationLoading } from "@/components/app/loading-overlay";

export function LoginPanel({ demoMode, nextPath, initialMessage = "" }: { demoMode: boolean; nextPath?: string; initialMessage?: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(false);

  async function demoLogin(role: "admin" | "captain") {
    setLoading(true);
    const response = await fetch("/api/demo/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ role }) });
    setLoading(false);
    if (!response.ok) return setMessage("Demo login could not be started.");
    showNavigationLoading("Opening your workspace");
    router.push(role === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  }

  async function passwordLogin(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    const response = await fetch("/api/auth/sign-in", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ identifier, password, next: nextPath }) });
    const result = await response.json() as { redirectTo?: string; error?: string };
    setLoading(false);
    if (!response.ok || !result.redirectTo) return setMessage(result.error ?? "Sign-in failed.");
    showNavigationLoading("Signing you in");
    router.push(result.redirectTo);
    router.refresh();
  }

  if (demoMode) return <div className="grid gap-4"><div className="rounded-md border border-[#d7aa54]/35 bg-[#d7aa54]/10 p-4 text-sm leading-6 text-[#66491f]">Demo access uses sample data and non-payable UPI review records. Choose a role to preview the protected product.</div><Button className="h-12 justify-between bg-[#313999] px-5 text-white" disabled={loading} onClick={() => demoLogin("captain")}><span className="inline-flex items-center gap-2"><UserRound data-icon="inline-start"/>Preview captain portal</span><ArrowRight data-icon="inline-end"/></Button><Button variant="outline" className="h-12 justify-between px-5" disabled={loading} onClick={() => demoLogin("admin")}><span className="inline-flex items-center gap-2"><ShieldCheck data-icon="inline-start"/>Preview admin CRM</span><ArrowRight data-icon="inline-end"/></Button>{message && <p role="alert" className="text-sm text-destructive">{message}</p>}</div>;

  return <form onSubmit={passwordLogin}><FieldGroup><Field><FieldLabel htmlFor="identifier">Username or admin email</FieldLabel><Input id="identifier" name="identifier" autoComplete="username" className="h-11" required value={identifier} onChange={(event)=>setIdentifier(event.target.value)}/><FieldDescription>Captains use the username shared by the organizer. Administrators use their approved email address.</FieldDescription></Field><Field><FieldLabel htmlFor="password">Password</FieldLabel><Input id="password" name="password" type="password" autoComplete="current-password" className="h-11" required value={password} onChange={(event)=>setPassword(event.target.value)}/></Field><Button type="submit" className="h-11 bg-[#313999] text-white" disabled={loading}>{loading ? "Signing in…" : "Sign in"}<ArrowRight data-icon="inline-end"/></Button>{message && <FieldError aria-live="polite">{message}</FieldError>}</FieldGroup></form>;
}

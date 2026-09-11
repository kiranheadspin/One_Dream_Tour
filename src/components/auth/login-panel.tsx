"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { parseAuthHash } from "@/lib/auth-hash-callback";

export function LoginPanel({ demoMode, nextPath, initialMessage = "" }: { demoMode: boolean; nextPath?: string; initialMessage?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const parsed = parseAuthHash(window.location.hash);
    if (parsed.kind === "error" && parsed.error === "invalid-link") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      const id = window.setTimeout(() => setMessage("This sign-in link is invalid or expired. Request a new link."), 0);
      return () => window.clearTimeout(id);
    }
  }, []);

  async function demoLogin(role: "admin" | "captain") {
    setLoading(true);
    const response = await fetch("/api/demo/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ role }) });
    setLoading(false);
    if (!response.ok) return setMessage("Demo login could not be started.");
    router.push(role === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  }

  async function emailLogin(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    const response = await fetch("/api/auth/sign-in", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, next: nextPath }) });
    const result = await response.json() as { message?: string; error?: string };
    setLoading(false); setMessage(result.message ?? result.error ?? "Check your email.");
  }

  if (demoMode) return <div className="grid gap-4"><div className="rounded-md border border-[#d7aa54]/35 bg-[#d7aa54]/10 p-4 text-sm leading-6 text-[#66491f]">Demo access uses sample data and non-payable UPI review records. Choose a role to preview the protected product.</div><Button className="h-12 justify-between bg-[#313999] px-5 text-white" disabled={loading} onClick={() => demoLogin("captain")}><span className="inline-flex items-center gap-2"><UserRound data-icon="inline-start"/>Preview captain portal</span><ArrowRight data-icon="inline-end"/></Button><Button variant="outline" className="h-12 justify-between px-5" disabled={loading} onClick={() => demoLogin("admin")}><span className="inline-flex items-center gap-2"><ShieldCheck data-icon="inline-start"/>Preview admin CRM</span><ArrowRight data-icon="inline-end"/></Button>{message && <p role="alert" className="text-sm text-destructive">{message}</p>}</div>;

  return <form onSubmit={emailLogin} className="grid gap-5"><Field><FieldLabel htmlFor="email">Work email</FieldLabel><Input id="email" type="email" autoComplete="email" className="h-11" required value={email} onChange={(event)=>setEmail(event.target.value)}/><FieldDescription>We will email a secure, single-use sign-in link. Access is limited to invited captains and administrators.</FieldDescription></Field><Button type="submit" className="h-11 bg-[#313999] text-white" disabled={loading}>{loading ? "Sending…" : "Send sign-in link"}<ArrowRight data-icon="inline-end"/></Button>{message && <p role="status" aria-live="polite"><FieldError>{message}</FieldError></p>}</form>;
}

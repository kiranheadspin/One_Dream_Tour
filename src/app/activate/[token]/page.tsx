import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { CaptainActivationForm } from "@/components/auth/captain-activation-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCaptainActivation } from "@/lib/captain-access";
import { isDemoMode } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function CaptainActivationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const activation = isDemoMode ? null : await getCaptainActivation(token);
  return <main className="grid min-h-screen bg-[#081326] lg:grid-cols-[1fr_0.8fr]"><section className="relative hidden overflow-hidden lg:block"><Image src="/images/one-dream-cup-hero.png" alt="One Dream Cup cricket" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-center opacity-70"/><div className="absolute inset-0 bg-[#081326]/35"/><div className="absolute inset-x-12 bottom-14 text-white"><p className="eyebrow text-[#d7aa54]">Captain access</p><h1 className="mt-3 max-w-xl text-5xl leading-tight">Set your password. Then take your team to Goa.</h1></div></section><section className="flex items-center justify-center bg-[#f7f3ea] px-5 py-16"><div className="w-full max-w-md"><p className="eyebrow text-[#8d672c]">Private activation</p><h2 className="mt-3 text-4xl text-[#081326]">Welcome, {activation?.fullName ?? "captain"}.</h2><p className="mt-3 text-sm leading-6 text-slate-600">This link can be used once. Your password is stored securely by Supabase and is never shown to the organizer.</p><div className="mt-8">{activation ? <CaptainActivationForm token={token} username={activation.username}/> : <Alert variant="destructive"><AlertTriangle/><AlertTitle>Activation link unavailable</AlertTitle><AlertDescription>This link is invalid, expired, or has already been used. Ask the tournament organizer to create a new one.</AlertDescription></Alert>}</div><Link href="/login" className="mt-8 inline-block text-sm font-medium text-[#313999]">← Return to sign in</Link></div></section></main>;
}

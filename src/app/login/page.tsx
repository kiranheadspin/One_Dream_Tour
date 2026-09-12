import Image from "next/image";
import Link from "next/link";
import { LoginPanel } from "@/components/auth/login-panel";
import { isDemoMode } from "@/lib/env";
import { getSession } from "@/lib/auth";
import { destinationForRole, safeRelativePath } from "@/lib/auth-redirects";
import { redirect } from "next/navigation";

const LOGIN_ERRORS: Record<string, string> = {
  "not-authorized": "This account has not been assigned access. Contact the tournament organizer.",
  "temporarily-unavailable": "Sign-in is temporarily unavailable. Please try again shortly.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const query = await searchParams;
  const session = await getSession();
  if (session) redirect(destinationForRole(session.role, query.next));
  const nextPath = safeRelativePath(query.next) ?? undefined;
  const initialMessage = query.error ? LOGIN_ERRORS[query.error] ?? "Sign-in could not be completed." : "";
  return (
    <main className="grid min-h-screen bg-[#081326] lg:grid-cols-[1fr_0.8fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <Image src="/images/one-dream-cup-hero.png" alt="One Dream Cup cricket" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-center opacity-70" />
        <div className="absolute inset-0 bg-[#081326]/35" />
        <div className="absolute inset-x-12 bottom-14 text-white">
          <p className="eyebrow text-[#d7aa54]">50th Special Edition</p>
          <h1 className="mt-3 max-w-xl text-5xl leading-tight">Your team’s road to Goa, managed in one place.</h1>
        </div>
      </section>
      <section className="flex items-center justify-center bg-[#f7f3ea] px-5 py-16">
        <div className="w-full max-w-md">
          <p className="eyebrow text-[#8d672c]">Secure access</p>
          <h2 className="mt-3 text-4xl text-[#081326]">Welcome back.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Captains manage only their own registration. Administrators access tournament operations according to their assigned role.</p>
          <div className="mt-8"><LoginPanel demoMode={isDemoMode} nextPath={nextPath} initialMessage={initialMessage} /></div>
          <Link href="/" className="mt-8 inline-block text-sm font-medium text-[#313999]">← Return to public site</Link>
        </div>
      </section>
    </main>
  );
}

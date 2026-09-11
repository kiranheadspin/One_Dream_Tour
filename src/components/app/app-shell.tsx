import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { OneDreamGroupLogo } from "@/components/brand/one-dream-group-logo";
import { DesktopAppNavigation, MobileAppNavigation } from "@/components/app/app-navigation";
import type { AppSession } from "@/lib/auth";

export function AppShell({ session, children }: { session: AppSession; children: React.ReactNode }) {
  const home = session.role === "admin" ? "/admin" : "/dashboard";
  const roleLabel = session.role === "admin" ? "Tournament CRM" : "Captain portal";
  return (
    <div className="min-h-screen bg-[#f5f2eb] md:grid md:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[268px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r border-white/8 bg-[#081326] text-white md:flex md:flex-col">
        <Link href="/" aria-label="One Dream Group home" className="mx-6 mt-6 mb-7">
          <OneDreamGroupLogo alt="One Dream Group" className="w-full max-w-[208px]" priority />
        </Link>
        <div className="px-7 pb-5">
          <p className="eyebrow text-[#d7aa54]">{roleLabel}</p>
          <p className="mt-2 text-xs leading-5 text-white/42">{session.role === "admin" ? "Tournament operations" : "Lead your team. Live the dream."}</p>
        </div>
        <DesktopAppNavigation role={session.role} />
        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-lg px-2 py-3"><span className="grid size-10 place-items-center rounded-full bg-white/10"><UserRound aria-hidden="true" className="size-4"/></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{session.name}</p><p className="truncate text-xs text-white/45">{session.loginIdentifier}</p></div></div>
          <form action="/api/auth/sign-out" method="post"><button className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-xs text-white/55 hover:bg-white/8 hover:text-white" type="submit"><LogOut aria-hidden="true" className="size-4"/>Sign out</button></form>
        </div>
      </aside>
      <div className="min-w-0">
        {session.demo && <div className="border-b border-[#d7aa54]/40 bg-[#d7aa54]/15 px-4 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#6f501f]">Demo workspace · sample records · no live payments</div>}
        <header className="sticky top-0 z-40 flex min-h-[72px] items-center justify-between gap-4 border-b border-white/10 bg-[#081326] px-4 text-white shadow-sm md:hidden">
          <Link href={home} className="min-w-0">
            <span className="block truncate font-heading text-xl">One Dream Cup</span>
            <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#d7aa54]">{roleLabel}</span>
          </Link>
          <MobileAppNavigation session={session} />
        </header>
        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10 xl:py-10">{children}</main>
      </div>
    </div>
  );
}

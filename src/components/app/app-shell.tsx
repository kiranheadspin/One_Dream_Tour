import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BarChart3, ClipboardCheck, CreditCard, FileText, LayoutDashboard, LogOut, Megaphone, Settings, ShieldCheck, Trophy, UserRound, Users } from "lucide-react";
import { OneDreamGroupLogo } from "@/components/brand/one-dream-group-logo";
import type { AppSession } from "@/lib/auth";

const captainLinks: [string, string, LucideIcon][] = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Team & players", "/dashboard/team", Users],
  ["Rules", "/dashboard/rules", ClipboardCheck],
  ["Documents", "/dashboard/documents", FileText],
  ["Payment", "/dashboard/payment", CreditCard],
  ["Confirmation", "/dashboard/confirmation", Trophy],
  ["Announcements", "/dashboard/announcements", Megaphone],
  ["Preferences", "/dashboard/preferences", Settings],
];
const adminLinks: [string, string, LucideIcon][] = [
  ["Overview", "/admin", LayoutDashboard],
  ["Leads", "/admin/leads", Users],
  ["Teams", "/admin/teams", ShieldCheck],
  ["Payments", "/admin/payments", CreditCard],
  ["Reports", "/admin/reports", BarChart3],
  ["Content", "/admin/content", Megaphone],
  ["Settings", "/admin/settings", Settings],
];

export function AppShell({ session, children }: { session: AppSession; children: React.ReactNode }) {
  const links = session.role === "admin" ? adminLinks : captainLinks;
  return (
    <div className="min-h-screen bg-[#f3f1eb] md:grid md:grid-cols-[230px_1fr]">
      <aside className="hidden min-h-screen bg-[#081326] text-white md:flex md:flex-col">
        <Link href="/" aria-label="One Dream Group home" className="m-5">
          <OneDreamGroupLogo alt="One Dream Group" className="w-full" priority />
        </Link>
        <div className="px-5 pb-4"><p className="eyebrow text-[#d7aa54]">{session.role === "admin" ? "Tournament CRM" : "Captain portal"}</p></div>
        <nav aria-label={`${session.role} navigation`} className="grid gap-1 px-3">
          {links.map(([label,href,Icon])=><Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/65 hover:bg-white/10 hover:text-white"><Icon aria-hidden="true" className="size-4"/>{label}</Link>)}
        </nav>
        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-3 px-2 py-3"><span className="grid size-9 place-items-center rounded-full bg-white/10"><UserRound aria-hidden="true" className="size-4"/></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{session.name}</p><p className="truncate text-xs text-white/45">{session.loginIdentifier}</p></div></div>
          <form action="/api/auth/sign-out" method="post"><button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-white/55 hover:bg-white/10 hover:text-white" type="submit"><LogOut aria-hidden="true" className="size-4"/>Sign out</button></form>
        </div>
      </aside>
      <div className="min-w-0">
        {session.demo && <div className="border-b border-[#d7aa54]/40 bg-[#d7aa54]/15 px-4 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#6f501f]">Demo workspace · sample records · no live payments</div>}
        <header className="grid gap-3 border-b bg-white px-4 py-4 md:hidden"><div className="flex items-center justify-between"><Link href={session.role === "admin" ? "/admin" : "/dashboard"} className="font-heading text-xl text-[#081326]">One Dream Cup</Link><form action="/api/auth/sign-out" method="post"><button type="submit" aria-label="Sign out" className="grid size-9 place-items-center rounded-md border text-slate-600"><LogOut aria-hidden="true" className="size-4"/></button></form></div><nav className="flex gap-5 overflow-x-auto pb-1 text-xs font-semibold">{links.map(([label,href])=><Link className="shrink-0" key={href} href={href}>{label}</Link>)}</nav></header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

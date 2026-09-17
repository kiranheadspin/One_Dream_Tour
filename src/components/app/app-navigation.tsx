"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  FileText,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { OneDreamGroupLogo } from "@/components/brand/one-dream-group-logo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AppRole, AppSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

type AppLink = [label: string, href: string, icon: LucideIcon];

const captainLinks: AppLink[] = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Team & players", "/dashboard/team", Users],
  ["Schedule", "/dashboard/schedule", CalendarDays],
  ["Rules", "/dashboard/rules", ClipboardCheck],
  ["Documents", "/dashboard/documents", FileText],
  ["Payment", "/dashboard/payment", CreditCard],
  ["Confirmation", "/dashboard/confirmation", Trophy],
  ["Announcements", "/dashboard/announcements", Megaphone],
  ["Preferences", "/dashboard/preferences", Settings],
  ["Public site", "/", Globe2],
];

const adminLinks: AppLink[] = [
  ["Overview", "/admin", LayoutDashboard],
  ["Leads", "/admin/leads", Users],
  ["Teams", "/admin/teams", ShieldCheck],
  ["Schedule", "/admin/schedule", CalendarDays],
  ["Payments", "/admin/payments", CreditCard],
  ["Reports", "/admin/reports", BarChart3],
  ["Content", "/admin/content", Megaphone],
  ["Settings", "/admin/settings", Settings],
  ["Public site", "/", Globe2],
];

function linksFor(role: AppRole) {
  return role === "admin" ? adminLinks : captainLinks;
}

function isCurrentPath(pathname: string, href: string) {
  if (href === "/admin" || href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopAppNavigation({ role }: { role: AppRole }) {
  const pathname = usePathname();

  return (
    <nav aria-label={`${role} navigation`} className="grid gap-1.5 px-4">
      {linksFor(role).map(([label, href, Icon]) => {
        const active = isCurrentPath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex min-h-11 items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition-colors",
              active
                ? "bg-[#d7aa54] text-[#081326] shadow-[0_8px_24px_rgba(0,0,0,.18)]"
                : "text-white/64 hover:bg-white/8 hover:text-white",
            )}
          >
            <Icon aria-hidden="true" className="size-[18px] shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileAppNavigation({ session }: { session: AppSession }) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const roleLabel = session.role === "admin" ? "Tournament CRM" : "Captain portal";

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => setOpenPath(nextOpen ? pathname : null)}>
      <SheetTrigger
        aria-label="Open workspace navigation"
        className="grid size-11 shrink-0 place-items-center rounded-lg border border-white/18 bg-white/6 text-white transition-colors hover:bg-white/12"
      >
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="h-dvh max-h-dvh w-[min(88vw,23rem)] gap-0 overflow-hidden border-white/10 bg-[#081326] p-0 text-white">
        <SheetHeader className="shrink-0 border-b border-white/10 px-6 py-6">
          <OneDreamGroupLogo alt="One Dream Group" className="w-[190px]" priority />
          <SheetTitle className="mt-5 text-xl text-white">{roleLabel}</SheetTitle>
          <SheetDescription className="text-white/50">
            {session.role === "admin" ? "Run tournament operations." : "Manage your team registration."}
          </SheetDescription>
        </SheetHeader>
        <nav aria-label={`${session.role} mobile navigation`} className="grid min-h-0 flex-1 content-start gap-1.5 overflow-y-auto overscroll-contain px-4 py-5">
          {linksFor(session.role).map(([label, href, Icon]) => {
            const active = isCurrentPath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpenPath(null)}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-lg px-4 text-[15px] font-medium",
                  active ? "bg-[#d7aa54] text-[#081326]" : "text-white/72 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon aria-hidden="true" className="size-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-white/10 p-5">
          <div aria-label="Signed in profile" className="flex items-center gap-3 rounded-lg bg-white/6 p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10">
              <UserRound aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{session.name}</p>
              <p className="truncate text-xs text-white/45">{session.loginIdentifier}</p>
            </div>
          </div>
          <form action="/api/auth/sign-out" method="post" className="mt-3">
            <button className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-white/60 hover:bg-white/8 hover:text-white" type="submit">
              <LogOut aria-hidden="true" className="size-4" /> Sign out
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

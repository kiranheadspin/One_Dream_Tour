"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { GoaNavLink } from "@/components/public/goa-nav-link";
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  ["Tournament", "/tournament"],
  ["Cities", "/cities"],
  ["Road to Goa", "/road-to-goa"],
  ["Rules", "/rules"],
  ["FAQ", "/faq"],
  ["Corporate Events", "/corporate-events"],
] as const;

export function MobileNav({ dashboardHref }: { dashboardHref?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger aria-label="Open navigation" className="inline-flex size-11 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white lg:hidden">
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>
      <SheetContent className="w-[min(88vw,23rem)] border-white/10 bg-[#081326] text-white" side="right">
        <SheetHeader className="border-b border-white/10 p-6">
          <SheetTitle className="text-xl text-white">One Dream Cup</SheetTitle>
          <SheetDescription className="text-white/60">50th Special Edition</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1 p-4">
          {links.map(([label, href]) => (
            href === "/road-to-goa" ? (
              <GoaNavLink key={href} mobile onClick={() => setOpen(false)} />
            ) : (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center rounded-md px-4 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            )
          ))}
        </nav>
        <div className="mt-auto grid gap-3 p-6">
          <Link href={dashboardHref ?? "/login"} className="rounded-md border border-white/20 px-4 py-3 text-center font-medium">{dashboardHref ? "Go to dashboard" : "Captain login"}</Link>
          <Link href="/register" className="rounded-md bg-[#d7aa54] px-4 py-3 text-center font-semibold text-[#081326]">Register interest</Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

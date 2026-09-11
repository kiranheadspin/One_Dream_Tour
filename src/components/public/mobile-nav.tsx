"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { GoaNavLink } from "@/components/public/goa-nav-link";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  ["Tournament", "/tournament"],
  ["Cities", "/cities"],
  ["Road to Goa", "/road-to-goa"],
  ["Rules", "/rules"],
  ["FAQ", "/faq"],
  ["Corporate Events", "/corporate-events"],
] as const;

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger aria-label="Open navigation" className="inline-flex size-10 items-center justify-center rounded-md border border-white/20 text-white md:hidden">
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>
      <SheetContent className="bg-[#081326] text-white" side="right">
        <SheetHeader className="border-b border-white/10 p-6">
          <SheetTitle className="text-xl text-white">One Dream Cup</SheetTitle>
          <SheetDescription className="text-white/60">50th Special Edition</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1 p-4">
          {links.map(([label, href]) => (
            href === "/road-to-goa" ? (
              <GoaNavLink key={href} mobile />
            ) : (
              <Link
                key={href}
                href={href}
                className="rounded-md px-4 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            )
          ))}
        </nav>
        <div className="mt-auto grid gap-3 p-6">
          <Link href="/login" className="rounded-md border border-white/20 px-4 py-3 text-center font-medium">Captain login</Link>
          <Link href="/register" className="rounded-md bg-[#d7aa54] px-4 py-3 text-center font-semibold text-[#081326]">Register interest</Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

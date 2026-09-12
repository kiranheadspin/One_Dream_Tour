import Link from "next/link";
import { OneDreamGroupLogo } from "@/components/brand/one-dream-group-logo";
import { GoaNavLink } from "@/components/public/goa-nav-link";
import { MobileNav } from "@/components/public/mobile-nav";
import { getSession } from "@/lib/auth";
import { destinationForRole } from "@/lib/auth-redirects";

const links = [["Tournament", "/tournament"], ["Cities", "/cities"], ["Road to Goa", "/road-to-goa"], ["Rules", "/rules"], ["Sponsors", "/sponsors"], ["FAQ", "/faq"]] as const;

export async function SiteHeader() {
  const session = await getSession();
  const dashboardHref = session ? destinationForRole(session.role) : undefined;

  return (
    <header className="absolute inset-x-0 top-0 z-40 border-b border-white/10 bg-[#081326]/90 text-white backdrop-blur-sm">
      <div className="container-shell flex h-16 items-center justify-between gap-4 sm:h-20 sm:gap-6">
        <Link href="/" aria-label="One Dream Group home" className="shrink-0">
          <OneDreamGroupLogo priority className="w-[168px] sm:w-[208px]" />
        </Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-5 lg:flex xl:gap-6">
          {links.map(([label, href]) => href === "/road-to-goa" ? (
            <GoaNavLink key={href} />
          ) : (
            <Link key={href} href={href} className="text-sm text-white/70 transition-colors hover:text-white">{label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {dashboardHref ? (
            <Link href={dashboardHref} className="text-sm font-medium text-white/75 hover:text-white">Go to dashboard</Link>
          ) : (
            <Link href="/login" className="text-sm font-medium text-white/75 hover:text-white">Login</Link>
          )}
          <Link href="/register" className="rounded-md bg-[#d7aa54] px-4 py-2.5 text-sm font-bold text-[#081326] transition-colors hover:bg-[#e3bb6c]">Register interest</Link>
        </div>
        <MobileNav dashboardHref={dashboardHref} />
      </div>
    </header>
  );
}

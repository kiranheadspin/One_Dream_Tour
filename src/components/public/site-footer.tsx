import Link from "next/link";
import { OneDreamGroupLogo } from "@/components/brand/one-dream-group-logo";
import { TOURNAMENT, whatsappUrl } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="bg-[#050b16] text-white">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-md">
          <OneDreamGroupLogo alt="One Dream Group" className="w-[240px] max-w-full" />
          <p className="mt-5 text-sm leading-6 text-white/60">Bringing corporate teams together through cricket, shared experiences and a memorable road to Goa.</p>
        </div>
        <div>
          <p className="eyebrow text-[#d7aa54]">Explore</p>
          <div className="mt-5 grid gap-3 text-sm text-white/65">
            <Link href="/tournament">Tournament</Link><Link href="/cities">Cities</Link><Link href="/sponsors">Sponsors</Link><Link href="/corporate-events">Corporate events</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow text-[#d7aa54]">Support</p>
          <div className="mt-5 grid gap-3 text-sm text-white/65">
            <a href={whatsappUrl("Hello One Dream Cup team")}>WhatsApp +91 {TOURNAMENT.whatsapp}</a><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refund-policy">Refund policy</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">© 2026 One Dream Group. One Dream Cup 50th Special Edition.</div>
    </footer>
  );
}

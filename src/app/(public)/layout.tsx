import type { Metadata } from "next";
import { DemoBanner } from "@/components/public/demo-banner";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  authors: [{ name: "One Dream Group" }],
  creator: "One Dream Group",
  publisher: "One Dream Group",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    name: "One Dream Group",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/images/one-dream-group-logo.png"),
    contactPoint: [{ "@type": "ContactPoint", telephone: "+91-9591011861", contactType: "customer service", availableLanguage: ["English"] }],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }} /><DemoBanner /><div className="relative h-0"><SiteHeader /></div><main className="flex-1">{children}</main><SiteFooter /></>;
}

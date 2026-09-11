import { DemoBanner } from "@/components/public/demo-banner";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <><DemoBanner /><div className="relative h-0"><SiteHeader /></div><main className="flex-1">{children}</main><SiteFooter /></>;
}

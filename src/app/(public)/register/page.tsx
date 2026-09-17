import type { Metadata } from "next";
import { BadgeIndianRupee, Building2, Clock3, MapPin } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { PageHero } from "@/components/public/page-hero";

export const metadata: Metadata = {
  title: "Register Your Corporate Cricket Team",
  description: "Submit an enquiry to register your company team for the One Dream Cup corporate tennis-ball cricket tournament.",
  alternates: { canonical: "/register" },
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const value = (key: string) => typeof query[key] === "string" ? query[key] as string : "";
  const attribution = { utmSource: value("utm_source"), utmMedium: value("utm_medium"), utmCampaign: value("utm_campaign"), utmTerm: value("utm_term"), utmContent: value("utm_content"), referralCode: value("ref"), landingPage: "/register" };
  const notes = [
    { icon: Clock3, title: "Under a minute", copy: "Only five details and one confirmation." },
    { icon: MapPin, title: "Four city qualifiers", copy: "Bangalore, Chennai, Hyderabad and Pune." },
    { icon: Building2, title: "Pure corporate teams", copy: "Maximum one current state player per team." },
    { icon: BadgeIndianRupee, title: "₹14,500 per team", copy: "The entry fee is paid to complete registration." },
  ];

  return (
    <>
      <PageHero eyebrow="50th Special Edition" title="The road to Goa starts here.">
        <p>Register your corporate cricket team for the One Dream Cup S50. City competitions run from 21 November 2026 to 31 January 2027.</p>
      </PageHero>
      <section className="bg-[#f7f3ea] py-12 sm:py-16">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.65fr_1.35fr]">
          <aside>
            <p className="eyebrow text-[#8d672c]">Before you begin</p>
            <div className="mt-6 grid gap-5">
              {notes.map(({ icon: Icon, title, copy }) => (
                <div key={title} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#313999]"><Icon aria-hidden="true" className="size-5" /></span>
                  <div><h2 className="font-sans text-sm font-bold text-[#081326]">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p></div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm leading-6 text-slate-600">Questions? Contact the operations team on WhatsApp at 9591011861.</p>
          </aside>
          <div className="bg-white p-6 shadow-sm sm:p-10"><LeadForm attribution={attribution} /></div>
        </div>
      </section>
    </>
  );
}

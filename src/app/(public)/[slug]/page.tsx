import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BadgeCheck, CalendarDays, FileText, MapPin, ShieldCheck, Trophy, Users } from "lucide-react";
import { RULES_SOURCE, RULES_VERSION } from "@/lib/tournament-rules";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/public/page-hero";
import { RegisterInterestLink } from "@/components/public/register-interest-link";
import { SponsorShowcase } from "@/components/public/sponsor-showcase";
import { publicPages, type PublicPageSlug } from "@/lib/public-content";
import { TOURNAMENT, formatInr } from "@/lib/constants";

export function generateStaticParams() { return Object.keys(publicPages).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = publicPages[slug as PublicPageSlug];
  return page ? {
    title: page.title,
    description: page.intro,
    alternates: { canonical: `/${slug}` },
    openGraph: { title: page.title, description: page.intro, url: `/${slug}`, images: ["/images/one-dream-cup-hero.png"] },
  } : {};
}

export default async function PublicInfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = publicPages[slug as PublicPageSlug];
  if (!page) notFound();
  if (slug === "rules") return <RulesPage page={publicPages.rules} />;

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title}>
        <p>{page.intro}</p>
      </PageHero>
      <section className="section-pad bg-[#f7f3ea]">
        <div className="container-shell">
          {slug === "sponsors" ? <SponsorShowcase /> : null}
          <div className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-3">
            {page.sections.map((section) => (
              <article key={section.title} className="bg-white p-7 sm:p-9">
                <h2 className="text-2xl text-[#081326]">{section.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{section.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-[#d7aa54]/50 pt-8 sm:flex-row sm:items-center">
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Ready to discuss a team, partnership or event? Start with the short enquiry so the right person can follow up.
            </p>
            <RegisterInterestLink />
          </div>
        </div>
      </section>
    </>
  );
}

function RulesPage({ page }: { page: typeof publicPages.rules }) {
  const primaryRules = page.sections.slice(0, 6);
  const matchRules = page.sections.slice(6, 12);
  const commercialRules = page.sections.slice(12);
  const ruleGroups = [
    { title: "Eligibility and format", eyebrow: "Start here", sections: primaryRules },
    { title: "On-field playing rules", eyebrow: "Match day", sections: matchRules },
    { title: "Fees, awards and open details", eyebrow: "Commercials", sections: commercialRules },
  ] as const;

  const quickFacts = [
    { label: "Team type", value: "Company teams only", icon: Users },
    { label: "Playing side", value: "11-a-side", icon: ShieldCheck },
    { label: "Entry fee", value: formatInr(TOURNAMENT.feePaise), icon: BadgeCheck },
    { label: "Prize pool", value: formatInr(TOURNAMENT.prizePoolPaise), icon: Trophy },
  ] as const;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#081326] pt-24 text-white sm:pt-32">
        <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-[#f7f3ea]" />
        <div className="container-shell py-12 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="eyebrow text-[#d7aa54]">{page.eyebrow}</p>
              <h1 className="mt-4 max-w-4xl text-balance text-4xl leading-[1.04] sm:text-6xl">{page.title}</h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/[0.68]">{page.intro}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={RULES_SOURCE.url} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#d7aa54] px-6 text-sm font-bold text-[#081326] transition-colors hover:bg-[#e3bb6c]">
                  <FileText aria-hidden="true" className="size-4" />
                  Read source PDF
                </a>
                <Link href="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/[0.08] px-6 text-sm font-semibold text-white transition-colors hover:bg-white/[0.14]">
                  Register interest
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </div>
            <aside className="border border-white/[0.12] bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <p className="text-xs font-bold tracking-[0.2em] text-[#d7aa54] uppercase">Current version</p>
              <p className="mt-3 break-words font-mono text-sm text-white">{RULES_VERSION}</p>
              <div className="mt-5 border-t border-white/10 pt-5 text-sm leading-6 text-white/[0.62]">
                Captains accept this version from the dashboard. If terms change later, the accepted version remains traceable.
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f3ea] pb-16">
        <div className="container-shell">
          <div className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            {quickFacts.map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white p-5">
                <Icon aria-hidden="true" className="size-5 text-[#4048b5]" />
                <p className="mt-5 text-xs font-bold tracking-[0.18em] text-slate-500 uppercase">{label}</p>
                <p className="mt-2 font-heading text-2xl text-[#081326]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr_1.15fr]">
            <div className="border-l-4 border-[#d7aa54] bg-white p-6">
              <CalendarDays aria-hidden="true" className="size-6 text-[#4048b5]" />
              <h2 className="mt-4 text-2xl text-[#081326]">Confirmed city windows</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Bangalore, Pune, Hyderabad and Chennai city dates are listed below. Venues, Goa dates and registration deadlines still need separate confirmation.</p>
            </div>
            <div className="border-l-4 border-[#d7aa54] bg-white p-6">
              <MapPin aria-hidden="true" className="size-6 text-[#4048b5]" />
              <h2 className="mt-4 text-2xl text-[#081326]">Road to Goa</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Two teams from each city qualify for the eight-team Goa quarter-finals, followed by semi-finals and the final.</p>
            </div>
            <div className="border border-amber-300/70 bg-amber-50 p-6">
              <AlertTriangle aria-hidden="true" className="size-6 text-amber-700" />
              <h2 className="mt-4 text-2xl text-[#081326]">Details not yet published</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">Squad limits, substitute rules, tied-match procedures, venues, GST treatment, payment schedule and refund terms require a future organiser announcement.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-shell">
          <div className="max-w-3xl">
            <p className="eyebrow text-[#8d672c]">Rulebook summary</p>
            <h2 className="mt-4 text-balance text-4xl text-[#081326] sm:text-5xl">Everything public teams need before they enquire.</h2>
          </div>

          <div className="mt-10 space-y-12">
            {ruleGroups.map((group) => (
              <section key={group.title} aria-labelledby={`${group.eyebrow.toLowerCase().replaceAll(" ", "-")}-rules`}>
                <div className="mb-5 flex flex-col justify-between gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="eyebrow text-[#8d672c]">{group.eyebrow}</p>
                    <h3 id={`${group.eyebrow.toLowerCase().replaceAll(" ", "-")}-rules`} className="mt-2 text-3xl text-[#081326]">{group.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500">{group.sections.length} rules</p>
                </div>
                <div className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-2 xl:grid-cols-3">
                  {group.sections.map((section) => (
                    <article key={section.title} className="bg-white p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-xl leading-7 text-[#081326]">{section.title}</h4>
                        {"sourcePage" in section ? <span className="shrink-0 rounded-full bg-[#f7f3ea] px-2.5 py-1 text-[11px] font-bold text-[#8d672c]">p. {section.sourcePage}</span> : null}
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-600">{section.body}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-5 border-t border-[#d7aa54]/50 pt-8 sm:flex-row sm:items-center">
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Questions about eligibility or company documentation? Send an enquiry and the operations team can confirm the right next step before payment.
            </p>
            <RegisterInterestLink />
          </div>
        </div>
      </section>
    </>
  );
}

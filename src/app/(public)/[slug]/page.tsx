import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/public/page-hero";
import { RegisterInterestLink } from "@/components/public/register-interest-link";
import { SponsorShowcase } from "@/components/public/sponsor-showcase";
import { publicPages, type PublicPageSlug } from "@/lib/public-content";

export function generateStaticParams() { return Object.keys(publicPages).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = publicPages[slug as PublicPageSlug];
  return page ? { title: page.eyebrow, description: page.intro } : {};
}

export default async function PublicInfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = publicPages[slug as PublicPageSlug];
  if (!page) notFound();
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

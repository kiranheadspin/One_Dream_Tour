import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin, Trophy } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { CITY_SCHEDULE, TOURNAMENT } from "@/lib/constants";

export function generateStaticParams() { return TOURNAMENT.cities.map((city) => ({ city: city.toLowerCase() })); }

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params;
  const city = TOURNAMENT.cities.find((item) => item.toLowerCase() === slug);
  if (!city) return {};
  const description = `Join the One Dream Cup ${city} corporate tennis-ball cricket league. Your company team can compete for one of two qualification places in the Goa finals.`;
  return { title: `Corporate Cricket Tournament in ${city}`, description, alternates: { canonical: `/cities/${slug}` }, openGraph: { title: `Corporate Cricket Tournament in ${city}`, description, url: `/cities/${slug}`, images: ["/images/one-dream-cup-hero.png"] } };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const city = TOURNAMENT.cities.find((item) => item.toLowerCase() === slug);
  if (!city) notFound();
  return <><PageHero eyebrow={`${city} city league`} title={`Represent your company in ${city}.`}><p>Pure corporate tennis-ball cricket, with two qualification places on the road to Goa.</p></PageHero><section className="section-pad bg-[#f7f3ea]"><div className="container-shell"><div className="grid gap-5 md:grid-cols-3">{[{icon:CalendarDays,title:'Confirmed dates',copy:CITY_SCHEDULE[city].dates},{icon:MapPin,title:'City stages',copy:'League matches, pre-quarter-finals, quarter-finals and semi-finals.'},{icon:Trophy,title:'Qualification',copy:'The top two teams advance to the eight-team Goa quarter-finals and receive ₹10,000 each for Goa travel.'}].map(({icon:Icon,title,copy})=><article key={title} className="bg-white p-7"><Icon aria-hidden="true" className="size-6 text-[#4048b5]"/><h2 className="mt-6 text-2xl text-[#081326]">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p></article>)}</div><p className="mt-5 text-sm text-slate-500">Venue and registration deadline will be announced separately.</p><div className="mt-10 bg-[#081326] p-8 text-white sm:flex sm:items-center sm:justify-between"><div><p className="eyebrow text-[#d7aa54]">Interested in {city}?</p><p className="mt-3 max-w-xl text-sm leading-6 text-white/60">Submit the short enquiry. Our team will confirm company eligibility and availability before inviting registration.</p></div><Link href="/register" className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-[#d7aa54] px-5 text-sm font-bold text-[#081326] sm:mt-0">Start enquiry <ArrowRight aria-hidden="true" className="size-4"/></Link></div></div></section></>;
}

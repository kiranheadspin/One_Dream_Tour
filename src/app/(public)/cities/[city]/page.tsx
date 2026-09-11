import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin, Trophy } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { TOURNAMENT } from "@/lib/constants";

export function generateStaticParams() { return TOURNAMENT.cities.map((city) => ({ city: city.toLowerCase() })); }

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const city = TOURNAMENT.cities.find((item) => item.toLowerCase() === slug);
  if (!city) notFound();
  return <><PageHero eyebrow={`${city} city league`} title={`Represent your company in ${city}.`}><p>Seven-over corporate cricket with at least two league matches and two qualification places on the road to Goa.</p></PageHero><section className="section-pad bg-[#f7f3ea]"><div className="container-shell"><div className="grid gap-5 md:grid-cols-3">{[{icon:CalendarDays,title:'Season window',copy:'September–December 2026. Exact date and deadline are still to be published.'},{icon:MapPin,title:'Venue',copy:'The verified venue will appear here after the administrator confirms it.'},{icon:Trophy,title:'Qualification',copy:'Two teams from this city advance to the eight-team quarter-finals in Goa.'}].map(({icon:Icon,title,copy})=><article key={title} className="bg-white p-7"><Icon aria-hidden="true" className="size-6 text-[#4048b5]"/><h2 className="mt-6 text-2xl text-[#081326]">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p></article>)}</div><div className="mt-10 bg-[#081326] p-8 text-white sm:flex sm:items-center sm:justify-between"><div><p className="eyebrow text-[#d7aa54]">Interested in {city}?</p><p className="mt-3 max-w-xl text-sm leading-6 text-white/60">Submit the short enquiry. Our team will confirm company eligibility and availability before inviting registration.</p></div><Link href="/register" className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-[#d7aa54] px-5 text-sm font-bold text-[#081326] sm:mt-0">Start enquiry <ArrowRight aria-hidden="true" className="size-4"/></Link></div></div></section></>;
}

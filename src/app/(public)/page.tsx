import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, Check, ShieldCheck, Trophy, Users } from "lucide-react";
import { RegisterInterestLink } from "@/components/public/register-interest-link";
import { TOURNAMENT, formatInr, whatsappUrl } from "@/lib/constants";

const cities = [
  { name: "Bangalore", note: "Where the league energy begins", code: "BLR" },
  { name: "Chennai", note: "Corporate grit meets cricket culture", code: "MAA" },
  { name: "Hyderabad", note: "Big teams. Bigger ambition.", code: "HYD" },
  { name: "Pune", note: "A new chapter on the road to Goa", code: "PNQ" },
] as const;

const prizeBreakdown = [
  { label: "Winner", amountPaise: TOURNAMENT.winnerPaise },
  { label: "Runner-up", amountPaise: TOURNAMENT.runnerUpPaise },
  { label: "Losing semi-finalists", amountPaise: TOURNAMENT.losingSemiFinalistPaise, suffix: "each" },
  { label: "Losing quarter-finalists", amountPaise: TOURNAMENT.losingQuarterFinalistPaise, suffix: "each" },
] as const;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: "One Dream Cup — 50th Special Edition",
  description: "A pure corporate seven-over tennis-ball cricket tournament across Bangalore, Chennai, Hyderabad and Pune, with finals in Goa.",
  startDate: "2026-09",
  endDate: "2026-12",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  organizer: { "@type": "Organization", name: "One Dream Group", url: siteUrl },
  location: TOURNAMENT.cities.map((city) => ({ "@type": "Place", name: `${city} city league` })),
  offers: { "@type": "Offer", price: "14500", priceCurrency: "INR", availability: "https://schema.org/LimitedAvailability", url: `${siteUrl}/register` },
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="relative isolate min-h-[760px] overflow-hidden bg-[#081326] text-white">
        <Image src="/images/one-dream-cup-hero.png" alt="Corporate cricket player ready to bat under stadium lights" fill priority sizes="100vw" className="-z-20 object-cover object-[68%_center] opacity-90" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,16,31,.98)_0%,rgba(5,16,31,.93)_43%,rgba(5,16,31,.34)_68%,rgba(5,16,31,.05)_100%)] max-md:bg-[#081326]/76" />
        <div className="container-shell flex min-h-[760px] items-center pt-28 sm:pt-32">
          <div className="w-full max-w-[650px] py-10 sm:py-16">
            <h1 className="text-5xl leading-none font-bold tracking-[-0.03em] text-[#d7aa54] uppercase sm:text-7xl lg:text-[5.5rem]">One Dream Cup</h1>
            <p className="mt-2 font-heading text-3xl font-semibold tracking-wide text-white sm:text-4xl">{TOURNAMENT.edition}</p>
            <p className="mt-5 text-lg font-semibold text-white sm:mt-7 sm:text-xl">Pure corporate tennis-ball cricket tournament</p>
            <p className="mt-3 text-sm font-bold tracking-wide text-[#e6c27d] sm:text-base">Bangalore <span className="mx-2 text-white/35">•</span> Chennai <span className="mx-2 text-white/35">•</span> Hyderabad <span className="mx-2 text-white/35">•</span> Pune</p>
            <div className="mt-5 grid gap-3 text-sm text-white/75 sm:mt-7 sm:grid-cols-2">
              <p className="flex items-center gap-3"><CalendarDays aria-hidden="true" className="size-5 text-[#d7aa54]" />September—December 2026</p>
              <p className="flex items-center gap-3"><Trophy aria-hidden="true" className="size-5 text-[#d7aa54]" />Two teams per city advance to Goa</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7">
              <div className="border border-[#d7aa54]/65 bg-[#081326]/70 p-3 sm:p-4"><p className="font-heading text-2xl text-[#d7aa54] sm:text-3xl">{formatInr(TOURNAMENT.feePaise)}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/55 sm:text-xs">Team entry fee</p></div>
              <div data-testid="hero-prize-pool" className="border border-[#d7aa54]/65 bg-[#081326]/70 p-3 sm:p-4"><p className="font-heading text-2xl text-[#d7aa54] sm:text-3xl">{formatInr(TOURNAMENT.prizePoolPaise)}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/55 sm:text-xs">Total prize pool</p></div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:mt-7 sm:flex-row">
              <Link href="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#d7aa54] px-6 text-sm font-bold text-[#081326] hover:bg-[#e3bb6c]">Register team interest <ArrowRight aria-hidden="true" className="size-4" /></Link>
              <Link href="/rules" className="inline-flex h-12 items-center justify-center rounded-md border border-[#d7aa54]/65 bg-[#081326]/60 px-6 text-sm font-semibold text-white hover:bg-white/10">View eligibility & rules</Link>
            </div>
            <a href={whatsappUrl("Hello, I would like to know more about One Dream Cup.")} className="mt-5 inline-flex text-sm font-semibold text-white/75 underline decoration-[#d7aa54] underline-offset-6 hover:text-white">WhatsApp +91 9591011861</a>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f3ea] section-pad">
        <div className="container-shell grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div><p className="eyebrow text-[#8d672c]">Built for corporate teams</p><h2 className="mt-4 text-balance text-4xl leading-tight text-[#081326] sm:text-5xl">Cricket with a purpose bigger than the scoreboard.</h2></div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[{icon:Building2,title:'Corporate only',copy:'Every team represents a company and its people.'},{icon:Users,title:'Team-first format',copy:'League matches guarantee every team time on the field.'},{icon:ShieldCheck,title:'Operationally clear',copy:'Verified rules, consent records and controlled registration.'}].map(({icon:Icon,title,copy}) => <div key={title} className="border-t-2 border-[#d7aa54] bg-white p-6 shadow-sm"><Icon aria-hidden="true" className="size-6 text-[#4048b5]"/><h3 className="mt-5 text-xl text-[#081326]">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white" id="cities">
        <div className="container-shell">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow text-[#8d672c]">Four city leagues</p><h2 className="mt-4 text-4xl text-[#081326] sm:text-5xl">Choose your home ground.</h2></div><Link href="/cities" className="inline-flex items-center gap-2 text-sm font-bold text-[#313999]">Explore all cities <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
          <div className="mt-10 grid border-y border-slate-200 md:grid-cols-2">
            {cities.map((city,index)=><Link href={`/cities/${city.name.toLowerCase()}`} key={city.name} className={`group flex min-h-48 items-end justify-between border-slate-200 p-7 transition-colors hover:bg-[#081326] hover:text-white ${index%2===0?'md:border-r':''} ${index<2?'border-b':''}`}><div><span className="text-xs font-bold tracking-[0.2em] text-[#8d672c] group-hover:text-[#d7aa54]">{city.code}</span><h3 className="mt-3 text-3xl">{city.name}</h3><p className="mt-3 text-sm text-slate-500 group-hover:text-white/60">{city.note}</p></div><ArrowRight aria-hidden="true" className="size-5 text-[#4048b5] group-hover:text-[#d7aa54]"/></Link>)}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#081326] py-20 text-white">
        <div className="container-shell grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div><p className="eyebrow text-[#d7aa54]">The road to Goa</p><h2 className="mt-4 text-balance text-4xl sm:text-5xl">Eight qualifiers. One unforgettable finish.</h2><p className="mt-6 max-w-xl leading-7 text-white/65">Two teams from every city advance to the quarter-finals in Goa. Exact match dates and venues will be published only after they are confirmed.</p><Link href="/road-to-goa" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#e6c27d]">See the tournament journey <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
          <div className="border border-white/12 bg-white/5 p-7">
            {[['City league','League stage with at least two matches per team'],['Top two qualify','Two city teams earn their Goa place'],['Goa quarter-finals','Eight teams enter the national finals'],['Champion crowned','One team takes the 50th Edition title']].map(([title,copy],index)=><div key={title} className="flex gap-4 border-b border-white/10 py-5 last:border-0"><span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#d7aa54]/50 font-heading text-[#d7aa54]">{index+1}</span><div><h3 className="text-lg">{title}</h3><p className="mt-1 text-sm text-white/55">{copy}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#f7f3ea]">
        <div className="container-shell grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1"><p className="eyebrow text-[#8d672c]">Prize & entry</p><h2 className="mt-4 text-4xl text-[#081326]">A special edition worth playing for.</h2></div>
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            <div className="bg-[#081326] p-7 text-white sm:col-span-2"><Trophy aria-hidden="true" className="size-7 text-[#d7aa54]"/><p className="mt-8 text-sm text-white/55">Total cash prize</p><p className="mt-2 font-heading text-5xl text-[#d7aa54]">{formatInr(TOURNAMENT.prizePoolPaise)}</p><dl data-testid="prize-breakdown" className="mt-7 grid gap-x-5 gap-y-5 border-t border-white/10 pt-5 text-sm sm:grid-cols-2">{prizeBreakdown.map(({label,amountPaise,...prize})=><div key={label}><dt className="text-white/55">{label}</dt><dd className="mt-1 font-bold text-white">{formatInr(amountPaise)}{"suffix" in prize ? ` ${prize.suffix}` : ""}</dd></div>)}</dl></div>
            <div className="border border-[#d7aa54]/50 bg-white p-7"><CalendarDays aria-hidden="true" className="size-7 text-[#4048b5]"/><p className="mt-8 text-sm text-slate-500">Team entry</p><p className="mt-2 font-heading text-3xl text-[#081326]">{formatInr(TOURNAMENT.feePaise)}</p><p className="mt-3 text-xs leading-5 text-slate-500">GST treatment and payment schedule will be confirmed before payment.</p></div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-shell">
          <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr]"><div><p className="eyebrow text-[#8d672c]">How registration works</p><h2 className="mt-4 text-4xl text-[#081326]">From enquiry to match day.</h2></div><div className="grid gap-px border bg-slate-200 sm:grid-cols-3">{[["01","Enquire","Share captain, company and city details."],["02","Get invited","We verify eligibility, availability and final terms."],["03","Register","Add players, accept rules and complete payment."]].map(([step,title,copy])=><article key={step} className="bg-[#f7f3ea] p-6"><span className="font-mono text-xs text-[#8d672c]">{step}</span><h3 className="mt-5 text-2xl text-[#081326]">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p></article>)}</div></div>
          <div className="mt-12 grid gap-5 border-t pt-10 lg:grid-cols-2"><article className="border border-dashed border-slate-300 p-7"><p className="eyebrow text-slate-500">Previous seasons</p><h3 className="mt-3 text-2xl text-[#081326]">Gallery awaiting organizer assets.</h3><p className="mt-3 text-sm leading-6 text-slate-600">This reserved structure will use real photographs and captions when they are supplied. No past winners or claims have been fabricated.</p></article><article className="bg-[#081326] p-7 text-white"><p className="eyebrow text-[#d7aa54]">Corporate events</p><h3 className="mt-3 text-2xl">More ways to bring teams together.</h3><p className="mt-3 text-sm leading-6 text-white/60">Discuss internal tournaments, multi-sport events, employee engagement and sponsorship opportunities.</p><div className="mt-5 flex gap-5"><Link href="/corporate-events" className="text-sm font-bold text-[#d7aa54]">Explore services</Link><Link href="/faq" className="text-sm font-bold text-white">Read FAQ</Link></div></article></div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-shell border border-slate-200 p-8 sm:p-12">
          <div className="grid gap-9 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="eyebrow text-[#8d672c]">Ready to step up?</p><h2 className="mt-3 text-balance text-4xl text-[#081326]">Start with a short team enquiry.</h2><ul className="mt-6 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">{['No player roster yet','Takes about 4 minutes','No payment at enquiry'].map(item=><li key={item} className="flex items-center gap-2"><Check aria-hidden="true" className="size-4 text-[#4048b5]"/>{item}</li>)}</ul></div><RegisterInterestLink /></div>
        </div>
      </section>
    </>
  );
}

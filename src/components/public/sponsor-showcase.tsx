import { ArrowUpRight } from "lucide-react";

const sponsors = [
  {
    name: "Our Genie App",
    href: "https://www.ourgenieapp.com/",
    description: "Home services on demand",
  },
] as const;

function OurGenieMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-auto w-28"
      viewBox="0 0 140 86"
    >
      <rect width="140" height="86" rx="12" fill="#4b4698" />
      <path
        d="M33 18h29v50H33V18Zm8 8v34h13V26H41Z"
        fill="#fff"
        fillRule="evenodd"
      />
      <path
        d="M76 18h31v9H85v33h13V48h-8v-9h17v29H76V18Z"
        fill="#fff"
      />
    </svg>
  );
}

export function SponsorShowcase() {
  return (
    <section aria-labelledby="sponsor-brands-title" className="mb-14 sm:mb-16">
      <div className="grid gap-8 border-b border-[#d7aa54]/50 pb-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
        <div>
          <p className="eyebrow text-[#8d672c]">Confirmed sponsors</p>
          <h2 id="sponsor-brands-title" className="mt-4 text-4xl text-[#081326] sm:text-5xl">
            Brands backing One Dream Cup.
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-600 lg:justify-self-end">
          Meet the brands supporting the 50th Special Edition. Additional confirmed sponsors can join this lineup as tournament partnerships are finalized.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sponsors.map((sponsor) => (
          <a
            key={sponsor.name}
            href={sponsor.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Visit ${sponsor.name} website (opens in a new tab)`}
            className="group flex min-h-64 flex-col items-center justify-center border border-slate-200 bg-white p-7 text-center shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-1 hover:border-[#d7aa54] hover:shadow-lg focus-visible:-translate-y-1 focus-visible:border-[#d7aa54] focus-visible:shadow-lg"
          >
            <OurGenieMark />
            <h3 className="mt-5 text-xl font-semibold text-[#2c2b49]">{sponsor.name}</h3>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {sponsor.description}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#313999]">
              Visit website
              <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

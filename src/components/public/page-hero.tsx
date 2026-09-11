import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="bg-[#081326] pt-36 text-white sm:pt-40">
      <div className="container-shell py-16 sm:py-20">
        <p className="eyebrow text-[#d7aa54]">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-balance text-4xl leading-tight sm:text-6xl">{title}</h1>
        {children && <div className="mt-6 max-w-2xl text-base leading-7 text-white/65">{children}</div>}
      </div>
    </section>
  );
}

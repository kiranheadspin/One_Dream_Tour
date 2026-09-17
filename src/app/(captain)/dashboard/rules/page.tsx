import { requireRole } from "@/lib/auth";
import { getCaptainTeam } from "@/lib/teams";
import { RulesAcceptance } from "@/components/captain/rules-acceptance";
import { RULES_SECTIONS, RULES_SOURCE, RULES_SUMMARY, RULES_VERSION } from "@/lib/tournament-rules";

export default async function CaptainRulesPage() {
  const session = await requireRole("captain");
  const team = await getCaptainTeam(session.userId);
  return <div className="mx-auto max-w-4xl">
    <p className="eyebrow text-[#8d672c]">Registration step 3</p>
    <h1 className="mt-2 text-4xl text-[#081326]">Rules acceptance</h1>
    <p className="mt-2 text-sm text-slate-600">Displayed version: {RULES_VERSION}</p>
    <a className="mt-3 inline-block text-sm font-semibold text-[#313999] underline" href={RULES_SOURCE.url}>Read the original S50 brochure (PDF)</a>
    <article className="mt-8 border bg-white p-6 sm:p-9">
      <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{RULES_SUMMARY.pfEntry}</p>
      <div className="mt-8 grid gap-7">{RULES_SECTIONS.map(({ title, body }) => <section key={title}><h2 className="text-2xl text-[#081326]">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{body}</p></section>)}</div>
      <div className="mt-8 border-t pt-6"><RulesAcceptance acceptedAt={team.rulesAcceptedAt} acceptedVersion={team.rulesVersion} /></div>
    </article>
  </div>;
}

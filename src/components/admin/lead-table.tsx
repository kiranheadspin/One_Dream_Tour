import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LeadStageSelect } from "@/components/admin/lead-stage-select";
import type { Lead } from "@/lib/types";

export function LeadTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-[0_10px_28px_rgba(8,19,38,.06)]">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
            <tr><th className="px-5 py-3">Reference / captain</th><th className="px-5 py-3">Company</th><th className="px-5 py-3">City</th><th className="px-5 py-3">Source</th><th className="px-5 py-3">Stage</th><th className="px-5 py-3">Follow-up</th><th className="px-5 py-3"><span className="sr-only">Open</span></th></tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t hover:bg-slate-50/70">
                <td className="px-5 py-4"><Link href={`/admin/leads/${lead.id}`} className="font-semibold text-[#081326] hover:underline">{lead.captainName}</Link><p className="mt-1 font-mono text-[11px] text-slate-400">{lead.reference}</p></td>
                <td className="px-5 py-4"><p className="font-medium">{lead.company}</p><p className="mt-1 max-w-44 truncate text-xs text-slate-500">{lead.email}</p></td>
                <td className="px-5 py-4">{lead.city}</td><td className="px-5 py-4">{lead.source}</td>
                <td className="px-5 py-4"><LeadStageSelect id={lead.id} stage={lead.stage} /></td>
                <td className="px-5 py-4 text-xs text-slate-500">{lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString("en-IN") : "—"}</td>
                <td className="px-5 py-4"><Link href={`/admin/leads/${lead.id}`} aria-label={`Open ${lead.captainName}`} className="grid size-9 place-items-center rounded-lg text-[#313999] hover:bg-[#313999]/8"><ArrowUpRight aria-hidden="true" className="size-4" /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid md:hidden">
        {leads.map((lead) => (
          <article key={lead.id} className="border-b p-4 last:border-0 sm:p-5">
            <div className="flex justify-between gap-4"><div className="min-w-0"><Link href={`/admin/leads/${lead.id}`} className="font-semibold text-[#081326]">{lead.captainName}</Link><p className="mt-1 truncate text-xs text-slate-500">{lead.company} · {lead.city}</p><p className="mt-1 break-all text-xs text-slate-500">{lead.email}</p></div><Link href={`/admin/leads/${lead.id}`} aria-label={`Open ${lead.captainName}`} className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#313999]/8"><ArrowUpRight aria-hidden="true" className="size-4 text-[#313999]" /></Link></div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><LeadStageSelect id={lead.id} stage={lead.stage} /><span className="font-mono text-[11px] text-slate-400">{lead.reference}</span></div>
          </article>
        ))}
      </div>
      {leads.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">No leads match these filters.</p> : null}
    </div>
  );
}

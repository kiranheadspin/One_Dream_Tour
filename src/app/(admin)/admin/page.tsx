import Link from "next/link";
import { ArrowRight, CalendarClock, IndianRupee, KeyRound, TrendingUp, Users } from "lucide-react";
import { AdminHeading } from "@/components/admin/admin-heading";
import { LeadTable } from "@/components/admin/lead-table";
import { readDemoDatabase } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { listLeads } from "@/lib/leads";

export default async function AdminDashboard() {
  const leads = await listLeads();
  const registered = leads.filter((lead) => lead.stage === "Registered").length;
  const due = leads.filter((lead) => lead.nextFollowUp && new Date(lead.nextFollowUp) <= new Date("2026-08-08")).length;
  const payments = isDemoMode ? (await readDemoDatabase()).payments.filter((item) => item.status === "paid").length : 0;
  const accessQueue = leads.filter((lead) => !lead.captainProvisioned && !["Lost", "Archived"].includes(lead.stage)).slice(0, 4);
  const metrics = [
    { label: "Active leads", value: leads.filter((lead) => lead.stage !== "Archived" && lead.stage !== "Lost").length, icon: Users, note: "current pipeline" },
    { label: "Registered", value: registered, icon: TrendingUp, note: "teams converted" },
    { label: "Follow-ups due", value: due, icon: CalendarClock, note: "through 8 Aug" },
    { label: "Payments recorded", value: payments, icon: IndianRupee, note: "demo workspace" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <AdminHeading
        eyebrow="Operations overview"
        title="Tournament pipeline"
        description="Lead movement, follow-ups and registration health in one operational view."
        action={
          <Link href="/admin/leads" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#313999]">
            All leads <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        }
      />

      <section aria-label="Pipeline metrics" className="mt-7 overflow-hidden rounded-xl border border-[#15223a] bg-[#081326] text-white shadow-[0_14px_35px_rgba(8,19,38,.12)]">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, note }, index) => (
            <div key={label} className={`min-w-0 p-4 sm:p-5 lg:p-6 ${index % 2 === 0 ? "border-r border-white/10" : ""} ${index < 2 ? "border-b border-white/10 lg:border-b-0" : ""} ${index === 1 || index === 2 ? "lg:border-r" : ""}`}>
              <div className="flex items-center gap-2.5 text-white/60">
                <Icon aria-hidden="true" className="size-4 shrink-0 text-[#d7aa54]" />
                <p className="truncate text-xs font-medium sm:text-sm">{label}</p>
              </div>
              <p className="mt-3 font-heading text-3xl text-white sm:text-4xl">{value}</p>
              <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.14em] text-white/38 sm:text-[10px]">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-[#172640] bg-[#101f37] text-white shadow-[0_14px_35px_rgba(8,19,38,.1)]">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#d7aa54]/14 text-[#d7aa54]"><KeyRound aria-hidden="true" className="size-5" /></span>
            <div>
              <p className="eyebrow text-[#d7aa54]">Captain access</p>
              <h2 className="mt-1.5 text-xl leading-snug sm:text-2xl">Create usernames and WhatsApp activation links</h2>
              <p className="mt-1.5 text-sm text-white/52">Open an approved lead to generate private captain access.</p>
            </div>
          </div>
        </div>
        <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
          {accessQueue.map((lead) => (
            <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex min-h-12 items-center justify-between gap-3 bg-[#101f37] px-5 py-3 text-sm font-semibold hover:bg-[#172a49]">
              <span className="truncate">{lead.captainName}</span><ArrowRight aria-hidden="true" className="size-4 shrink-0 text-[#d7aa54]" />
            </Link>
          ))}
          {accessQueue.length === 0 ? <p className="bg-[#101f37] px-5 py-4 text-sm text-white/60 sm:col-span-2 xl:col-span-4">No active leads are waiting for captain access.</p> : null}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-2xl text-[#081326]">Recent leads</h2>
          <p className="mt-1 text-xs text-slate-500">Most recently created enquiries</p>
        </div>
        <LeadTable leads={leads.slice(0, 6)} />
      </section>
    </div>
  );
}

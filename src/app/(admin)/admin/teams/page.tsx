import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminHeading } from "@/components/admin/admin-heading";
import { listAdminTeams } from "@/lib/admin-data";

export default async function AdminTeamsPage() {
  const teams = await listAdminTeams();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminHeading eyebrow="Tournament operations" title="Teams" description="Invited and registered teams across every configured tournament." />
      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/admin/teams/${team.id}`}
            aria-label={`View ${team.name}`}
            className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#313999] focus-visible:ring-offset-2"
          >
            <article className="h-full border bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#d7aa54] hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl text-[#081326]">{team.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{team.company} · {team.city}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#313999]">Enquiry {team.enquiryReference}</p>
                </div>
                <Badge variant="secondary">{team.registrationStatus}</Badge>
              </div>
              <dl className="mt-6 grid grid-cols-3 gap-4 border-t pt-5 text-sm">
                <div><dt className="text-xs text-slate-500">Captain</dt><dd className="mt-1 font-medium">{team.captainName}</dd></div>
                <div><dt className="text-xs text-slate-500">Players</dt><dd className="mt-1 font-medium">{team.playerCount}</dd></div>
                <div><dt className="text-xs text-slate-500">Payment</dt><dd className="mt-1 font-medium">{team.paymentStatus}</dd></div>
              </dl>
              <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#313999]">View team details <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" /></p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}

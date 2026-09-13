import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminHeading } from "@/components/admin/admin-heading";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { getAdminTeam } from "@/lib/admin-data";

function formattedDate(value?: string) {
  return value ? new Date(value).toLocaleString("en-IN") : "Not recorded";
}

export default async function AdminTeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  await requireRole("admin");
  const { teamId } = await params;
  const team = await getAdminTeam(teamId);
  if (!team) notFound();

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/admin/teams" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#313999] hover:text-[#081326]">
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to teams
      </Link>
      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <AdminHeading eyebrow="Team record" title={team.name} description={`${team.company} · ${team.city}`} />
        <Badge variant="secondary" className="mt-1">{team.registrationStatus}</Badge>
      </div>

      <section className="mt-7 grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border bg-white p-5 sm:p-6">
          <h2 className="text-xl text-[#081326]">Team information</h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div><dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Company</dt><dd className="mt-1.5 font-semibold text-[#081326]">{team.company}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Tournament city</dt><dd className="mt-1.5 font-semibold text-[#081326]">{team.city}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Captain</dt><dd className="mt-1.5 font-semibold text-[#081326]">{team.captainName}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Enquiry</dt><dd className="mt-1.5 font-mono text-sm font-semibold text-[#081326]">{team.enquiryReference}</dd></div>
          </dl>
        </article>

        <article className="rounded-xl border bg-white p-5 sm:p-6">
          <h2 className="text-xl text-[#081326]">Registration status</h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div><dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Registration</dt><dd className="mt-1.5 font-semibold text-[#081326]">{team.registrationStatus}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Payment</dt><dd className="mt-1.5 font-semibold text-[#081326]">{team.paymentStatus}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Rules accepted</dt><dd className="mt-1.5 text-sm font-semibold text-[#081326]">{formattedDate(team.rulesAcceptedAt)}</dd></div>
            <div><dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Last updated</dt><dd className="mt-1.5 text-sm font-semibold text-[#081326]">{formattedDate(team.updatedAt)}</dd></div>
          </dl>
        </article>
      </section>

      <section className="mt-7 overflow-hidden rounded-xl border bg-white">
        <div className="flex items-start justify-between gap-4 border-b p-5 sm:items-center sm:p-6">
          <div>
            <h2 className="flex items-center gap-2 text-xl text-[#081326]"><Users aria-hidden="true" className="size-5 text-[#313999]" /> Team members</h2>
            <p className="mt-1 text-sm text-slate-500">All player details entered by the captain.</p>
          </div>
          <Badge variant="outline">{team.playerCount} {team.playerCount === 1 ? "member" : "members"}</Badge>
        </div>

        {team.players.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr><th className="px-6 py-3">Member</th><th className="px-6 py-3">Work email</th><th className="px-6 py-3">Phone</th><th className="px-6 py-3">Employee ID</th><th className="px-6 py-3">EPFO number</th></tr>
              </thead>
              <tbody>
                {team.players.map((player) => (
                  <tr key={player.id} className="border-t align-top">
                    <td className="px-6 py-4 font-semibold text-[#081326]">{player.name}{player.isCaptain ? <span className="ml-2 text-xs font-medium text-[#8d672c]">Captain</span> : null}</td>
                    <td className="px-6 py-4 break-all">{player.email}</td>
                    <td className="px-6 py-4">{player.phone}</td>
                    <td className="px-6 py-4">{player.employeeId}</td>
                    <td className="px-6 py-4">{player.epfoNumber || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">The captain has not added any team members yet.</div>
        )}
      </section>
    </div>
  );
}

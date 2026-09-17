import { RULES_SUMMARY } from "@/lib/tournament-rules";
import { requireRole } from "@/lib/auth";
import { getCaptainTeam } from "@/lib/teams";
import { AddPlayerDialog } from "@/components/captain/add-player-dialog";
import { PlayerActions } from "@/components/captain/player-actions";
import { TeamNameEditor } from "@/components/captain/team-name-editor";

function PlayerName({ name, email, isCaptain }: { name: string; email: string; isCaptain: boolean }) {
  return (
    <div>
      <p className="font-semibold text-[#081326]">
        {name}
        {isCaptain ? <span className="ml-2 text-xs font-medium text-[#8d672c]">Captain</span> : null}
      </p>
      <p className="mt-1 break-all text-xs text-slate-500">{email}</p>
    </div>
  );
}

export default async function TeamPage() {
  const session = await requireRole("captain");
  const team = await getCaptainTeam(session.userId);

  return (
    <div className="mx-auto max-w-6xl">
      <p className="eyebrow text-[#8d672c]">Registration step 2</p>
      <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl text-[#081326] sm:text-4xl">Team & players</h1>
          <p className="mt-2 text-sm text-slate-600">Keep player details current. The playing side is 11; eligibility is verified separately.</p>
        </div>
        <AddPlayerDialog />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{RULES_SUMMARY.pfEntry}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{RULES_SUMMARY.eligibility}</p>
      <div className="mt-6"><TeamNameEditor initialName={team.name} officialName={team.officialName ?? `${team.company} XI`} /></div>

      <section className="mt-6 overflow-hidden border bg-white sm:mt-8">
        <div className="grid gap-5 border-b p-4 sm:grid-cols-3 sm:p-6">
          <div>
            <p className="text-xs text-slate-500">Team</p>
            <p className="mt-1 font-semibold">{team.name}</p>
            <p className="mt-1 text-xs text-slate-500">Official record: {team.officialName ?? `${team.company} XI`}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Company</p>
            <p className="mt-1 font-semibold">{team.company}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">City</p>
            <p className="mt-1 font-semibold">{team.city}</p>
          </div>
        </div>

        <div className="divide-y md:hidden" data-testid="player-mobile-list">
          {team.players.map((player) => (
            <article key={player.id} className="space-y-4 p-4" data-testid="player-mobile-card">
              <PlayerName name={player.name} email={player.email} isCaptain={player.isCaptain} />
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Employee ID</dt>
                  <dd className="mt-1 break-words font-medium">{player.employeeId}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Phone</dt>
                  <dd className="mt-1 break-words font-medium">{player.phone}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-slate-500">EPFO number</dt>
                  <dd className="mt-1 break-words font-medium">{player.epfoNumber || "—"}</dd>
                </div>
              </dl>
              <PlayerActions player={player} />
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3">Player</th>
                <th className="px-6 py-3">Employee ID</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">EPFO number</th>
                <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {team.players.map((player) => (
                <tr key={player.id} className="border-t">
                  <td className="px-6 py-4"><PlayerName name={player.name} email={player.email} isCaptain={player.isCaptain} /></td>
                  <td className="px-6 py-4">{player.employeeId}</td>
                  <td className="px-6 py-4">{player.phone}</td>
                  <td className="px-6 py-4">{player.epfoNumber || "—"}</td>
                  <td className="px-6 py-4"><PlayerActions player={player} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

import { Clock3, MapPin, Megaphone } from "lucide-react";
import { formatFixtureDateTime, formatFixtureTime } from "@/lib/schedule-format";
import type { PublicScheduleFixture } from "@/lib/types";

export function PublishedFixtures({ fixtures }: { fixtures: PublicScheduleFixture[] }) {
  return (
    <section className="section-pad bg-white" id="fixtures" data-testid="public-fixtures">
      <div className="container-shell">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-[#8d672c]">Official schedule announcements</p>
            <h2 className="mt-4 text-balance text-4xl text-[#081326] sm:text-5xl">Published fixtures.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Fixtures appear here only after One Dream Cup operations publishes the confirmed teams, date, time and venue.</p>
          </div>
          {fixtures.length ? <span className="w-fit rounded-full bg-[#eef0ff] px-3 py-1 text-xs font-bold text-[#313999]">{fixtures.length} upcoming</span> : null}
        </div>
        {fixtures.length ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {fixtures.map((fixture) => (
              <article key={fixture.id} data-testid="public-fixture-card" className="border border-slate-200 bg-[#f7f3ea] p-6 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-[#8d672c]"><span>{fixture.roundName}</span><span aria-hidden="true">·</span><span>Match {fixture.matchNumber}</span></div>
                  <span className="rounded-full bg-[#313999] px-3 py-1 text-xs font-bold text-white">Published</span>
                </div>
                <h3 className="mt-5 text-2xl text-[#081326] sm:text-3xl">{fixture.homeTeamName} <span className="text-slate-400">vs</span> {fixture.awayTeamName}</h3>
                <div className="mt-6 grid gap-4 border-t border-slate-200 pt-5 text-sm sm:grid-cols-2">
                  <p className="flex items-start gap-3"><Clock3 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#313999]" /><span><b className="block text-[#081326]">{formatFixtureDateTime(fixture.startsAt)}</b>Ends {formatFixtureTime(fixture.endsAt)}</span></p>
                  <p className="flex items-start gap-3"><MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#313999]" /><span><b className="block text-[#081326]">{fixture.venueName}, {fixture.city}</b>{fixture.venueAddress ?? "Venue confirmed by operations"}</span></p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 flex items-start gap-4 border border-dashed border-slate-300 bg-[#f7f3ea] p-6 sm:p-8">
            <Megaphone aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-[#313999]" />
            <div><h3 className="text-xl text-[#081326]">No fixtures published yet</h3><p className="mt-2 text-sm leading-6 text-slate-600">Confirmed team matchups, dates, times and venues will be announced here.</p></div>
          </div>
        )}
      </div>
    </section>
  );
}

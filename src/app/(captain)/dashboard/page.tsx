import Link from "next/link";
import { hasAcceptedCurrentRules, PLAYING_SIDE_SIZE } from "@/lib/tournament-rules";
import { AlertTriangle, ArrowRight, CalendarDays, Check, Circle, Clock3, MapPin, MessageCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { whatsappUrl } from "@/lib/constants";
import { getCaptainTeamOrNull } from "@/lib/teams";
import { formatFixtureDateTime } from "@/lib/schedule-format";
import { listCaptainFixtures } from "@/lib/schedule";

export default async function CaptainDashboard() {
  const session = await requireRole("captain");
  const [team, fixtures] = await Promise.all([getCaptainTeamOrNull(session.userId), listCaptainFixtures()]);

  if (!team) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow text-[#8d672c]">Captain workspace</p>
        <h1 className="mt-2 text-3xl text-[#081326] sm:text-4xl">Registration access pending.</h1>
        <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm sm:p-9">
          <AlertTriangle aria-hidden="true" className="size-7 text-amber-600" />
          <h2 className="mt-5 text-2xl text-[#081326]">Your account is active, but no team is linked yet.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Ask the tournament organizer on WhatsApp to reconnect the team for username {session.loginIdentifier}. This usually means the account was activated before its team record became available.</p>
          <a href={whatsappUrl(`Hello, my captain username is ${session.loginIdentifier}, but no team is linked to my dashboard. Please help reconnect it.`)} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#313999] px-4 text-sm font-bold text-white">
            <MessageCircle aria-hidden="true" className="size-4" /> Contact organizer
          </a>
        </section>
      </div>
    );
  }

  const steps = [
    { label: "Company & team", complete: true, href: "/dashboard/team" },
    { label: "Players", complete: team.players.length >= PLAYING_SIDE_SIZE, href: "/dashboard/team" },
    { label: "Rules", complete: hasAcceptedCurrentRules(team), href: "/dashboard/rules" },
    { label: "Payment", complete: team.paymentStatus === "Paid", href: "/dashboard/payment" },
  ];
  const completion = steps.filter((step) => step.complete).length * 25;
  const registrationComplete = team.paymentStatus === "Paid";
  const nextHref = !hasAcceptedCurrentRules(team) ? "/dashboard/rules" : registrationComplete ? "/dashboard/confirmation" : "/dashboard/payment";
  const nextTitle = !hasAcceptedCurrentRules(team) ? "Review the rules" : registrationComplete ? "Registration complete" : "Complete payment";
  const nextCopy = !hasAcceptedCurrentRules(team)
    ? "Read and record acceptance of the displayed rules version."
    : registrationComplete
      ? "Your payment has been recorded and your team registration is confirmed."
      : "Review the confirmed amount and terms before paying.";
  const nextMatch = fixtures.find((fixture) => new Date(fixture.endsAt) >= new Date()) ?? fixtures[0];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-[#8d672c]">Captain workspace</p>
          <h1 className="mt-2 text-3xl leading-tight text-[#081326] sm:text-4xl">Welcome back, {session.name.split(" ")[0]}.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Complete your invited team registration in verified steps.</p>
        </div>
        <Badge variant="outline" className="h-8 rounded-full border-[#d7aa54] bg-white px-3 text-[#6f501f]">{team.registrationStatus}</Badge>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,.55fr)]">
        <div className="grid gap-5">
          <section className="overflow-hidden rounded-xl border bg-white shadow-[0_14px_35px_rgba(8,19,38,.08)]">
            <div className="flex items-start gap-4 p-5 sm:items-center sm:p-6">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#081326] text-[#d7aa54] sm:size-16"><Users aria-hidden="true" className="size-5 sm:size-7" /></span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Your team</p>
                <h2 className="mt-1 truncate text-2xl text-[#081326] sm:text-3xl">{team.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{team.officialName ?? `${team.company} XI`}</p>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-500"><MapPin aria-hidden="true" className="size-4 shrink-0" /><span className="truncate">{team.company} · {team.city}</span></p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-5 shadow-[0_14px_35px_rgba(8,19,38,.08)] sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-sm font-semibold text-[#081326]">Registration progress</p><p className="mt-1 text-xs text-slate-500">Complete each step to confirm your team.</p></div>
              <p className="font-heading text-3xl text-[#081326]">{completion}%</p>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#d7aa54]" style={{ width: `${completion}%` }} /></div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {steps.map((step, index) => (
                <Link href={step.href} key={step.label} className="group flex min-h-14 items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 transition-colors hover:border-[#d7aa54] hover:bg-[#fffaf0]">
                  <span className="flex min-w-0 items-center gap-3 text-sm font-semibold"><span className={`grid size-7 shrink-0 place-items-center rounded-full ${step.complete ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{step.complete ? <Check aria-hidden="true" className="size-4" /> : <Circle aria-hidden="true" className="size-3.5" />}</span><span className="truncate">{index + 1}. {step.label}</span></span>
                  <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-5">
          <div className="rounded-xl bg-[#081326] p-6 text-white shadow-[0_14px_35px_rgba(8,19,38,.16)]">
            <p className="eyebrow text-[#d7aa54]">Next action</p>
            <h2 className="mt-3 text-2xl">{nextTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">{nextCopy}</p>
            <Link href={nextHref} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#d7aa54] px-4 text-sm font-bold text-[#081326] hover:bg-[#e3bb6c]">Continue <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
          <div className="rounded-xl border bg-white p-5 sm:p-6">
            <Clock3 aria-hidden="true" className="size-5 text-[#313999]" />
            <h2 className="mt-4 text-xl text-[#081326]">Operational details</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Exact city date and venue are pending administrator confirmation. You will be notified when verified.</p>
          </div>
          {nextMatch ? (
            <Link href="/dashboard/schedule" className="group rounded-xl border border-[#d7aa54]/60 bg-[#fffaf0] p-5 transition-colors hover:border-[#d7aa54] sm:p-6">
              <CalendarDays aria-hidden="true" className="size-5 text-[#8d672c]" />
              <p className="eyebrow mt-4 text-[#8d672c]">Next match</p>
              <h2 className="mt-2 text-xl text-[#081326]">{nextMatch.homeTeamName} vs {nextMatch.awayTeamName}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{formatFixtureDateTime(nextMatch.startsAt)} · {nextMatch.venueName}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#313999]">View schedule <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

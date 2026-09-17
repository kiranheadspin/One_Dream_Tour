import { CalendarDays, Clock3, MapPin, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { requireRole } from "@/lib/auth";
import { formatFixtureDateTime, formatFixtureTime, fixtureWhatsappMessage } from "@/lib/schedule-format";
import { listCaptainFixtures } from "@/lib/schedule";

export default async function SchedulePage() {
  await requireRole("captain");
  const fixtures = await listCaptainFixtures();
  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow text-[#8d672c]">Tournament operations</p>
      <h1 className="mt-2 text-4xl text-[#081326]">Your match schedule</h1>
      <p className="mt-2 text-sm leading-7 text-slate-600">Only fixtures published by the organizer are shown. All times use India Standard Time.</p>
      {fixtures.length ? (
        <div className="mt-8 grid gap-5">
          {fixtures.map((fixture, index) => (
            <Card key={fixture.id} className={index === 0 ? "ring-[#d7aa54]" : undefined}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{fixture.roundName}</Badge><Badge variant="secondary">Match {fixture.matchNumber}</Badge></div>
                <CardTitle className="mt-2 text-2xl text-[#081326] sm:text-3xl">{fixture.homeTeamName} <span className="text-muted-foreground">vs</span> {fixture.awayTeamName}</CardTitle>
                <CardDescription>Published {fixture.publishedAt ? new Date(fixture.publishedAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : "by operations"}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <p className="flex items-start gap-3 text-sm"><Clock3 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#313999]" /><span><b className="block text-[#081326]">{formatFixtureDateTime(fixture.startsAt)}</b>Ends {formatFixtureTime(fixture.endsAt)}</span></p>
                <p className="flex items-start gap-3 text-sm"><MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#313999]" /><span><b className="block text-[#081326]">{fixture.venueName}</b>{fixture.venueAddress ?? fixture.city}</span></p>
                {fixture.notes ? <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground sm:col-span-2">{fixture.notes}</p> : null}
              </CardContent>
              <CardFooter>
                <Button variant="outline" nativeButton={false} render={<a href={`https://wa.me/?text=${encodeURIComponent(fixtureWhatsappMessage(fixture))}`} target="_blank" rel="noreferrer" />}>
                  <MessageCircle data-icon="inline-start" /> Share match details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="mt-8 border bg-white py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon"><CalendarDays /></EmptyMedia>
            <EmptyTitle>Awaiting verified publication</EmptyTitle>
            <EmptyDescription>Your exact match date, time and venue will appear here after the organizer publishes the fixture.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

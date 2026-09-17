import Link from "next/link";
import { CalendarDays, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { requireRole } from "@/lib/auth";
import { listCaptainAnnouncements } from "@/lib/schedule";

export default async function AnnouncementsPage() {
  await requireRole("captain");
  const announcements = await listCaptainAnnouncements();
  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow text-[#8d672c]">Updates</p>
      <h1 className="mt-2 text-4xl text-[#081326]">Announcements</h1>
      <p className="mt-2 text-sm leading-7 text-slate-600">Verified operational updates for your registration and fixtures.</p>
      {announcements.length ? (
        <div className="mt-8 grid gap-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div><Badge variant="secondary">Official update</Badge></div>
                <CardTitle className="mt-2 text-2xl text-[#081326]">{announcement.title}</CardTitle>
                <CardDescription>{announcement.publishedAt ? new Date(announcement.publishedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }) : ""}</CardDescription>
              </CardHeader>
              <CardContent><p className="text-sm leading-7 text-slate-600">{announcement.body}</p></CardContent>
              {announcement.fixtureId ? <CardFooter><Link href="/dashboard/schedule" className="inline-flex items-center gap-2 text-sm font-bold text-[#313999]"><CalendarDays aria-hidden="true" className="size-4" />View schedule</Link></CardFooter> : null}
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="mt-8 border bg-white py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon"><Megaphone /></EmptyMedia>
            <EmptyTitle>No published announcements</EmptyTitle>
            <EmptyDescription>Confirmed schedule, venue and tournament updates will be listed here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

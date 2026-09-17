"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CalendarPlus, Clock3, Edit3, MapPin, MessageCircle, Send, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { formatFixtureDateTime, formatFixtureTime, fixtureWhatsappMessage } from "@/lib/schedule-format";
import type { ScheduleCityOption, ScheduleFixture, ScheduleTeamOption, ScheduleVenue } from "@/lib/types";

interface SchedulePublisherProps {
  fixtures: ScheduleFixture[];
  teams: ScheduleTeamOption[];
  venues: ScheduleVenue[];
  cities: ScheduleCityOption[];
}

const DEFAULT_START = "2026-11-21T09:00";
const DEFAULT_END = "2026-11-21T10:30";

function indiaInputValue(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function toIsoInIndia(value: FormDataEntryValue | null) {
  return new Date(`${String(value)}:00+05:30`).toISOString();
}

function statusBadge(status: ScheduleFixture["status"]) {
  if (status === "published") return <Badge>Published</Badge>;
  if (status === "cancelled") return <Badge variant="destructive">Cancelled</Badge>;
  return <Badge variant="secondary">Draft</Badge>;
}

function shareUrl(fixture: ScheduleFixture) {
  return `https://wa.me/?text=${encodeURIComponent(fixtureWhatsappMessage(fixture))}`;
}

export function SchedulePublisher({ fixtures, teams, venues, cities }: SchedulePublisherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleFixture | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [venueOpen, setVenueOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<ScheduleVenue | null>(null);
  const [venueError, setVenueError] = useState("");

  const teamsByCity = new Map<string, ScheduleTeamOption[]>();
  for (const team of teams) teamsByCity.set(team.city, [...(teamsByCity.get(team.city) ?? []), team]);
  const venuesByCity = new Map<string, ScheduleVenue[]>();
  for (const venue of venues) venuesByCity.set(venue.city, [...(venuesByCity.get(venue.city) ?? []), venue]);

  function beginCreate() {
    setEditing(null);
    setFormError("");
    setOpen(true);
  }

  function beginEdit(fixture: ScheduleFixture) {
    setEditing(fixture);
    setFormError("");
    setOpen(true);
  }

  function beginVenueCreate() {
    setEditingVenue(null);
    setVenueError("");
    setVenueOpen(true);
  }

  function beginVenueEdit(venue: ScheduleVenue) {
    setEditingVenue(venue);
    setVenueError("");
    setVenueOpen(true);
  }

  async function writeFixture(payload: Record<string, unknown>, fixtureId?: string) {
    const response = await fetch(fixtureId ? `/api/admin/fixtures/${fixtureId}` : "/api/admin/fixtures", {
      method: fixtureId ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) throw new Error(result.error ?? "Fixture could not be saved.");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const fixtureId = editing?.id;
    setLoadingId(fixtureId ?? "new");
    setFormError("");
    try {
      await writeFixture({
        venueId: values.get("venueId"),
        homeTeamId: values.get("homeTeamId"),
        awayTeamId: values.get("awayTeamId"),
        roundName: values.get("roundName"),
        matchNumber: Number(values.get("matchNumber")),
        startsAt: toIsoInIndia(values.get("startsAt")),
        endsAt: toIsoInIndia(values.get("endsAt")),
        status: values.get("status"),
        notes: values.get("notes"),
      }, fixtureId);
      setOpen(false);
      toast.success(fixtureId ? "Fixture updated." : "Fixture created.");
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Fixture could not be saved.");
    } finally {
      setLoadingId(null);
    }
  }

  async function changeStatus(fixture: ScheduleFixture, status: ScheduleFixture["status"]) {
    setLoadingId(fixture.id);
    try {
      await writeFixture({
        venueId: fixture.venueId,
        homeTeamId: fixture.homeTeamId,
        awayTeamId: fixture.awayTeamId,
        roundName: fixture.roundName,
        matchNumber: fixture.matchNumber,
        startsAt: fixture.startsAt,
        endsAt: fixture.endsAt,
        status,
        notes: fixture.notes ?? "",
      }, fixture.id);
      toast.success(status === "published" ? "Fixture published with an announcement." : status === "draft" ? "Fixture returned to draft." : "Fixture cancelled.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fixture could not be updated.");
    } finally {
      setLoadingId(null);
    }
  }

  async function submitVenue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const venueId = editingVenue?.id;
    setLoadingId(venueId ? `venue-${venueId}` : "venue-new");
    setVenueError("");
    try {
      const response = await fetch(venueId ? `/api/admin/venues/${venueId}` : "/api/admin/venues", {
        method: venueId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Venue could not be saved.");
      setVenueOpen(false);
      setEditingVenue(null);
      toast.success(venueId ? "Venue updated." : "Venue added as a private scheduling option.");
      router.refresh();
    } catch (error) {
      setVenueError(error instanceof Error ? error.message : "Venue could not be saved.");
    } finally {
      setLoadingId(null);
    }
  }

  async function removeFixture(fixture: ScheduleFixture) {
    if (!window.confirm(`Delete ${fixture.roundName} match ${fixture.matchNumber}? Captains will no longer see this fixture or its announcement.`)) return;
    setLoadingId(fixture.id);
    try {
      const response = await fetch(`/api/admin/fixtures/${fixture.id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Fixture could not be deleted.");
      toast.success("Fixture deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fixture could not be deleted.");
    } finally {
      setLoadingId(null);
    }
  }

  async function removeVenue(venue: ScheduleVenue) {
    if (!window.confirm(`Delete ${venue.name}? This is only possible when no fixtures use it.`)) return;
    setLoadingId(`venue-${venue.id}`);
    try {
      const response = await fetch(`/api/admin/venues/${venue.id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Venue could not be deleted.");
      toast.success("Venue deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Venue could not be deleted.");
    } finally {
      setLoadingId(null);
    }
  }

  const publishedCount = fixtures.filter((fixture) => fixture.status === "published").length;
  const draftCount = fixtures.filter((fixture) => fixture.status === "draft").length;
  const canCreate = teams.length >= 2 && venues.length > 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardDescription>Total fixtures</CardDescription><CardTitle className="text-3xl">{fixtures.length}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader><CardDescription>Published</CardDescription><CardTitle className="text-3xl">{publishedCount}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader><CardDescription>Awaiting publication</CardDescription><CardTitle className="text-3xl">{draftCount}</CardTitle></CardHeader>
        </Card>
      </div>

      {!canCreate ? (
        <Alert className="mt-5">
          <ShieldAlert />
          <AlertTitle>Schedule setup needs reference data</AlertTitle>
          <AlertDescription>Add at least two teams and one venue before creating a fixture.</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl text-[#081326]">Fixture board</h2>
          <p className="mt-1 text-sm text-muted-foreground">Times are entered and displayed in India Standard Time.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={beginVenueCreate} disabled={!cities.length} className="h-11">
            <Building2 data-icon="inline-start" /> Add venue
          </Button>
          <Button onClick={beginCreate} disabled={!canCreate} className="h-11 bg-[#313999] text-white">
            <CalendarPlus data-icon="inline-start" /> New fixture
          </Button>
        </div>
      </div>

      <section className="mt-5" aria-labelledby="venue-list-heading">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 id="venue-list-heading" className="text-lg font-semibold text-[#081326]">Venues</h3>
            <p className="mt-1 text-sm text-muted-foreground">Edit venue details here. Delete is available after its fixtures have been removed.</p>
          </div>
          <Badge variant="secondary">{venues.length}</Badge>
        </div>
        {venues.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="venue-list">
            {venues.map((venue) => (
              <Card key={venue.id} data-testid="venue-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{venue.name}</CardTitle>
                  <CardDescription>{venue.city}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3 text-sm text-muted-foreground">{venue.address || "No address added"}</CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => beginVenueEdit(venue)} disabled={loadingId === `venue-${venue.id}`}>
                    <Edit3 data-icon="inline-start" /> Edit
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => removeVenue(venue)} disabled={loadingId === `venue-${venue.id}`}>
                    <Trash2 data-icon="inline-start" /> {loadingId === `venue-${venue.id}` ? "Deleting…" : "Delete"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      {fixtures.length ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2" data-testid="fixture-board">
          {fixtures.map((fixture) => (
            <Card key={fixture.id} data-testid="fixture-card">
              <CardHeader>
                <CardTitle>{fixture.roundName} · Match {fixture.matchNumber}</CardTitle>
                <CardDescription>{fixture.homeTeamName} vs {fixture.awayTeamName}</CardDescription>
                <CardAction>{statusBadge(fixture.status)}</CardAction>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <p className="flex items-start gap-2"><Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#313999]" /><span>{formatFixtureDateTime(fixture.startsAt)}–{formatFixtureTime(fixture.endsAt)}</span></p>
                <p className="flex items-start gap-2"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#313999]" /><span>{fixture.venueName}, {fixture.city}{fixture.venueAddress ? ` · ${fixture.venueAddress}` : ""}</span></p>
                {fixture.notes ? <p className="rounded-lg bg-muted p-3 text-muted-foreground">{fixture.notes}</p> : null}
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => beginEdit(fixture)} disabled={loadingId === fixture.id}>
                  <Edit3 data-icon="inline-start" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => removeFixture(fixture)} disabled={loadingId === fixture.id}>
                  <Trash2 data-icon="inline-start" /> {loadingId === fixture.id ? "Deleting…" : "Delete"}
                </Button>
                {fixture.status === "published" ? (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => changeStatus(fixture, "draft")} disabled={loadingId === fixture.id}>Unpublish</Button>
                    <Button size="sm" variant="outline" nativeButton={false} render={<a href={shareUrl(fixture)} target="_blank" rel="noreferrer" />}>
                      <MessageCircle data-icon="inline-start" /> Share
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => changeStatus(fixture, "published")} disabled={loadingId === fixture.id || fixture.status === "cancelled"}>
                    {loadingId === fixture.id ? <Spinner data-icon="inline-start" /> : <Send data-icon="inline-start" />} Publish
                  </Button>
                )}
                {fixture.status !== "cancelled" ? <Button size="sm" variant="ghost" onClick={() => changeStatus(fixture, "cancelled")} disabled={loadingId === fixture.id}>Cancel fixture</Button> : <Button size="sm" variant="outline" onClick={() => changeStatus(fixture, "draft")} disabled={loadingId === fixture.id}>Restore draft</Button>}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="mt-5 border bg-white py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon"><CalendarPlus /></EmptyMedia>
            <EmptyTitle>No fixtures yet</EmptyTitle>
            <EmptyDescription>Create the first draft. Captains see nothing until an administrator publishes it.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit fixture" : "Create fixture"}</DialogTitle>
            <DialogDescription>Drafts remain private. Publishing updates the participating captains and the public homepage.</DialogDescription>
          </DialogHeader>
          <form key={editing?.id ?? `new-${fixtures.length}`} onSubmit={submit}>
            <FieldGroup className="grid gap-4 py-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="fixture-round">Round</FieldLabel>
                <Input id="fixture-round" name="roundName" required defaultValue={editing?.roundName ?? "City qualifier"} className="h-11" />
              </Field>
              <Field>
                <FieldLabel htmlFor="fixture-number">Match number</FieldLabel>
                <Input id="fixture-number" name="matchNumber" type="number" min="1" max="999" required defaultValue={editing?.matchNumber ?? fixtures.length + 1} className="h-11" />
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="fixture-venue">Venue</FieldLabel>
                <NativeSelect id="fixture-venue" name="venueId" required defaultValue={editing?.venueId ?? venues[0]?.id} className="w-full [&>select]:h-11">
                  {Array.from(venuesByCity).map(([city, cityVenues]) => <NativeSelectOptGroup key={city} label={city}>{cityVenues.map((venue) => <NativeSelectOption key={venue.id} value={venue.id}>{venue.name} · {city}</NativeSelectOption>)}</NativeSelectOptGroup>)}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="fixture-home-team">First team</FieldLabel>
                <NativeSelect id="fixture-home-team" name="homeTeamId" required defaultValue={editing?.homeTeamId ?? teams[0]?.id} className="w-full [&>select]:h-11">
                  {Array.from(teamsByCity).map(([city, cityTeams]) => <NativeSelectOptGroup key={city} label={city}>{cityTeams.map((team) => <NativeSelectOption key={team.id} value={team.id}>{team.name} · {team.company}</NativeSelectOption>)}</NativeSelectOptGroup>)}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="fixture-away-team">Second team</FieldLabel>
                <NativeSelect id="fixture-away-team" name="awayTeamId" required defaultValue={editing?.awayTeamId ?? teams[1]?.id} className="w-full [&>select]:h-11">
                  {Array.from(teamsByCity).map(([city, cityTeams]) => <NativeSelectOptGroup key={city} label={city}>{cityTeams.map((team) => <NativeSelectOption key={team.id} value={team.id}>{team.name} · {team.company}</NativeSelectOption>)}</NativeSelectOptGroup>)}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="fixture-start">Start time</FieldLabel>
                <Input id="fixture-start" name="startsAt" type="datetime-local" required defaultValue={editing ? indiaInputValue(editing.startsAt) : DEFAULT_START} className="h-11" />
              </Field>
              <Field>
                <FieldLabel htmlFor="fixture-end">End time</FieldLabel>
                <Input id="fixture-end" name="endsAt" type="datetime-local" required defaultValue={editing ? indiaInputValue(editing.endsAt) : DEFAULT_END} className="h-11" />
              </Field>
              <Field>
                <FieldLabel htmlFor="fixture-status">Visibility</FieldLabel>
                <NativeSelect id="fixture-status" name="status" required defaultValue={editing?.status ?? "draft"} className="w-full [&>select]:h-11">
                  <NativeSelectOption value="draft">Draft</NativeSelectOption>
                  <NativeSelectOption value="published">Published</NativeSelectOption>
                  <NativeSelectOption value="cancelled">Cancelled</NativeSelectOption>
                </NativeSelect>
                <FieldDescription>Published fixtures appear for participating captains and on the public homepage. Captain notes remain team-only.</FieldDescription>
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="fixture-notes">Captain note (optional)</FieldLabel>
                <Textarea id="fixture-notes" name="notes" maxLength={500} defaultValue={editing?.notes ?? ""} placeholder="Arrival time, kit instructions or match-day contact details" />
              </Field>
              {formError ? <FieldError className="sm:col-span-2">{formError}</FieldError> : null}
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={Boolean(loadingId)}>Cancel</Button>
              <Button type="submit" disabled={Boolean(loadingId)}>
                {loadingId ? <Spinner data-icon="inline-start" /> : null}
                {loadingId ? "Saving…" : editing ? "Save changes" : "Create fixture"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={venueOpen} onOpenChange={(nextOpen) => { setVenueOpen(nextOpen); if (!nextOpen) setEditingVenue(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingVenue ? "Edit venue" : "Add a venue"}</DialogTitle>
            <DialogDescription>{editingVenue ? "Changes appear anywhere this venue is used." : "The venue remains an internal scheduling option until a fixture using it is published."}</DialogDescription>
          </DialogHeader>
          <form key={editingVenue?.id ?? `new-venue-${venues.length}`} onSubmit={submitVenue}>
            <FieldGroup className="py-3">
              <Field>
                <FieldLabel htmlFor="venue-city">Tournament city</FieldLabel>
                <NativeSelect id="venue-city" name="tournamentCityId" required defaultValue={editingVenue?.tournamentCityId ?? cities[0]?.id} className="w-full [&>select]:h-11">
                  {cities.map((city) => <NativeSelectOption key={city.id} value={city.id}>{city.city}</NativeSelectOption>)}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="venue-name">Venue name</FieldLabel>
                <Input id="venue-name" name="name" required minLength={2} maxLength={160} defaultValue={editingVenue?.name ?? ""} className="h-11" />
              </Field>
              <Field>
                <FieldLabel htmlFor="venue-address">Address (optional)</FieldLabel>
                <Textarea id="venue-address" name="address" maxLength={300} defaultValue={editingVenue?.address ?? ""} placeholder="Area, street or map-friendly directions" />
              </Field>
              {venueError ? <FieldError>{venueError}</FieldError> : null}
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setVenueOpen(false)} disabled={loadingId?.startsWith("venue-")}>Cancel</Button>
              <Button type="submit" disabled={loadingId?.startsWith("venue-")}>{loadingId?.startsWith("venue-") ? <Spinner data-icon="inline-start" /> : null}{loadingId?.startsWith("venue-") ? "Saving…" : editingVenue ? "Save changes" : "Add venue"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

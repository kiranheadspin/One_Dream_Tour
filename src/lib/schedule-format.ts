import type { ScheduleFixture } from "@/lib/types";

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export function formatFixtureDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatFixtureTime(value: string) {
  return timeFormatter.format(new Date(value));
}

export function fixtureWhatsappMessage(fixture: ScheduleFixture) {
  return `${fixture.roundName} · Match ${fixture.matchNumber}\n${fixture.homeTeamName} vs ${fixture.awayTeamName}\n${formatFixtureDateTime(fixture.startsAt)}\n${fixture.venueName}, ${fixture.city}`;
}

import "server-only";
import { readDemoDatabase } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PublicScheduleFixture } from "@/lib/types";

interface PublicFixtureRow {
  id: string;
  venue_name: string;
  venue_address: string | null;
  city: string;
  home_team_name: string;
  away_team_name: string;
  round_name: string;
  match_number: number;
  starts_at: string;
  ends_at: string;
  published_at: string | null;
}

export async function listPublicFixtures(): Promise<PublicScheduleFixture[]> {
  if (isDemoMode) {
    const database = await readDemoDatabase();
    return database.fixtures
      .filter((fixture) => fixture.status === "published" && new Date(fixture.endsAt) >= new Date())
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 6)
      .map((fixture) => ({
        id: fixture.id,
        venueName: fixture.venueName,
        venueAddress: fixture.venueAddress,
        city: fixture.city,
        roundName: fixture.roundName,
        matchNumber: fixture.matchNumber,
        startsAt: fixture.startsAt,
        endsAt: fixture.endsAt,
        homeTeamName: fixture.homeTeamName,
        awayTeamName: fixture.awayTeamName,
        publishedAt: fixture.publishedAt,
      }));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_public_published_fixtures");
  if (error) throw error;
  return ((data ?? []) as unknown as PublicFixtureRow[]).slice(0, 6).map((fixture) => ({
    id: fixture.id,
    venueName: fixture.venue_name,
    venueAddress: fixture.venue_address ?? undefined,
    city: fixture.city,
    roundName: fixture.round_name,
    matchNumber: fixture.match_number,
    startsAt: fixture.starts_at,
    endsAt: fixture.ends_at,
    homeTeamName: fixture.home_team_name,
    awayTeamName: fixture.away_team_name,
    publishedAt: fixture.published_at ?? undefined,
  }));
}

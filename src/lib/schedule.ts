import "server-only";
import { listAdminTeams } from "@/lib/admin-data";
import { deleteDemoFixture, deleteDemoVenue, readDemoDatabase, saveDemoFixture, saveDemoVenue } from "@/lib/demo-store";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ScheduleCityOption, ScheduleFixture, ScheduleTeamOption, ScheduleVenue, TournamentAnnouncement } from "@/lib/types";
import type { FixtureInput, VenueInput } from "@/lib/validation";

interface FixtureRow {
  id: string;
  tournament_id: string;
  venue_id: string;
  home_team_id: string;
  away_team_id: string;
  round_name: string;
  match_number: number;
  starts_at: string;
  ends_at: string;
  status: ScheduleFixture["status"];
  notes: string | null;
  published_at: string | null;
  updated_at: string;
  venues: { name: string; address: string | null; tournament_cities: { city: string } | Array<{ city: string }> } | Array<{ name: string; address: string | null; tournament_cities: { city: string } | Array<{ city: string }> }>;
  home_team: { name: string; member_name: string | null } | Array<{ name: string; member_name: string | null }>;
  away_team: { name: string; member_name: string | null } | Array<{ name: string; member_name: string | null }>;
}

interface CaptainFixtureRow {
  id: string;
  tournament_id: string;
  venue_id: string;
  venue_name: string;
  venue_address: string | null;
  city: string;
  home_team_id: string;
  home_team_name: string;
  away_team_id: string;
  away_team_name: string;
  round_name: string;
  match_number: number;
  starts_at: string;
  ends_at: string;
  status: ScheduleFixture["status"];
  notes: string | null;
  published_at: string | null;
  updated_at: string;
}

function first<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

function mapFixture(row: FixtureRow): ScheduleFixture {
  const venue = first(row.venues);
  const city = first(venue.tournament_cities);
  const homeTeam = first(row.home_team);
  const awayTeam = first(row.away_team);
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    venueId: row.venue_id,
    venueName: venue.name,
    venueAddress: venue.address ?? undefined,
    city: city.city,
    roundName: row.round_name,
    matchNumber: row.match_number,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    homeTeamId: row.home_team_id,
    homeTeamName: homeTeam.member_name ?? homeTeam.name,
    awayTeamId: row.away_team_id,
    awayTeamName: awayTeam.member_name ?? awayTeam.name,
    status: row.status,
    notes: row.notes ?? undefined,
    publishedAt: row.published_at ?? undefined,
    updatedAt: row.updated_at,
  };
}

const fixtureSelect = "id,tournament_id,venue_id,home_team_id,away_team_id,round_name,match_number,starts_at,ends_at,status,notes,published_at,updated_at,venues!inner(name,address,tournament_cities!inner(city)),home_team:teams!fixtures_home_team_id_fkey(name,member_name),away_team:teams!fixtures_away_team_id_fkey(name,member_name)";

export interface AdminScheduleData {
  fixtures: ScheduleFixture[];
  teams: ScheduleTeamOption[];
  venues: ScheduleVenue[];
  cities: ScheduleCityOption[];
}

export async function listAdminScheduleData(): Promise<AdminScheduleData> {
  if (isDemoMode) {
    const database = await readDemoDatabase();
    return {
      fixtures: [...database.fixtures].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
      teams: database.teams.map((team) => ({ id: team.id, name: team.name, officialName: team.officialName, company: team.company, city: team.city })),
      venues: database.venues,
      cities: ["Bangalore", "Chennai", "Hyderabad", "Pune"].map((city) => ({ id: `demo-city-${city.toLowerCase()}`, city })),
    };
  }

  const supabase = await createSupabaseServerClient();
  const [teams, citiesResult, venuesResult, fixturesResult] = await Promise.all([
    listAdminTeams(),
    supabase.from("tournament_cities").select("id,city").is("deleted_at", null).order("city"),
    supabase.from("venues").select("id,name,address,tournament_cities!inner(id,city)").is("deleted_at", null).order("name"),
    supabase.from("fixtures").select(fixtureSelect).is("deleted_at", null).order("starts_at"),
  ]);
  if (citiesResult.error) throw citiesResult.error;
  if (venuesResult.error) throw venuesResult.error;
  if (fixturesResult.error) throw fixturesResult.error;

  const venues: ScheduleVenue[] = (venuesResult.data ?? []).map((row) => {
    const city = first(row.tournament_cities);
    return { id: row.id, tournamentCityId: city.id, name: row.name, address: row.address ?? undefined, city: city.city };
  });
  return {
    fixtures: ((fixturesResult.data ?? []) as unknown as FixtureRow[]).map(mapFixture),
    teams: teams.map((team) => ({ id: team.id, name: team.memberName ?? team.name, officialName: team.name, company: team.company, city: team.city })),
    venues,
    cities: (citiesResult.data ?? []).map((city) => ({ id: city.id, city: city.city })),
  };
}

export async function listCaptainFixtures(): Promise<ScheduleFixture[]> {
  if (isDemoMode) {
    const database = await readDemoDatabase();
    const teamId = database.teams[0]?.id;
    return database.fixtures
      .filter((fixture) => fixture.status === "published" && (fixture.homeTeamId === teamId || fixture.awayTeamId === teamId))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_my_published_fixtures");
  if (error) throw error;
  return ((data ?? []) as unknown as CaptainFixtureRow[]).map((fixture) => ({
    id: fixture.id,
    tournamentId: fixture.tournament_id,
    venueId: fixture.venue_id,
    venueName: fixture.venue_name,
    venueAddress: fixture.venue_address ?? undefined,
    city: fixture.city,
    roundName: fixture.round_name,
    matchNumber: fixture.match_number,
    startsAt: fixture.starts_at,
    endsAt: fixture.ends_at,
    homeTeamId: fixture.home_team_id,
    homeTeamName: fixture.home_team_name,
    awayTeamId: fixture.away_team_id,
    awayTeamName: fixture.away_team_name,
    status: fixture.status,
    notes: fixture.notes ?? undefined,
    publishedAt: fixture.published_at ?? undefined,
    updatedAt: fixture.updated_at,
  }));
}

export async function listCaptainAnnouncements(): Promise<TournamentAnnouncement[]> {
  const fixtures = await listCaptainFixtures();
  const fixtureIds = new Set(fixtures.map((fixture) => fixture.id));
  if (isDemoMode) {
    const database = await readDemoDatabase();
    return database.announcements
      .filter((announcement) => announcement.publishedAt && (!announcement.fixtureId || fixtureIds.has(announcement.fixtureId)))
      .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("id,fixture_id,title,body,published_at,created_at,updated_at")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .filter((announcement) => !announcement.fixture_id || fixtureIds.has(announcement.fixture_id))
    .map((announcement) => ({
      id: announcement.id,
      fixtureId: announcement.fixture_id ?? undefined,
      title: announcement.title,
      body: announcement.body,
      publishedAt: announcement.published_at ?? undefined,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at,
    }));
}

export class FixtureSaveError extends Error {}

export async function saveFixture(input: FixtureInput, fixtureId: string | undefined, actor: string) {
  if (isDemoMode) {
    const result = await saveDemoFixture(input, fixtureId, actor);
    if (result.error || !result.fixture) throw new FixtureSaveError(result.error ?? "Fixture could not be saved.");
    return result.fixture;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("save_fixture", {
    p_fixture_id: fixtureId ?? null,
    p_venue_id: input.venueId,
    p_home_team_id: input.homeTeamId,
    p_away_team_id: input.awayTeamId,
    p_round_name: input.roundName,
    p_match_number: input.matchNumber,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_status: input.status,
    p_notes: input.notes || null,
  });
  if (error) {
    const safeMessages: Record<string, string> = {
      "23P01": error.message,
      "22023": error.message,
      "23503": "The selected venue or team is no longer available.",
      "23514": error.message,
    };
    throw new FixtureSaveError(safeMessages[error.code] ?? "Fixture could not be saved.");
  }
  if (!data) throw new FixtureSaveError("Fixture not found.");
  return data;
}

export async function saveVenue(input: VenueInput, venueId: string | undefined, actor: string) {
  if (isDemoMode) {
    const venue = await saveDemoVenue(input, venueId, actor);
    if (!venue) throw new FixtureSaveError(venueId ? "Venue not found." : "The selected tournament city is not available.");
    return venue;
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("save_venue", {
    p_venue_id: venueId ?? null,
    p_tournament_city_id: input.tournamentCityId,
    p_name: input.name,
    p_address: input.address || null,
  });
  if (error) {
    const safeMessages: Record<string, string> = {
      "22023": error.message,
      "23503": error.message,
      "23514": error.message,
    };
    throw new FixtureSaveError(safeMessages[error.code] ?? "Venue could not be saved.");
  }
  if (!data) throw new FixtureSaveError("Venue not found.");
  const row = data as { id: string; tournament_city_id: string; name: string; address: string | null };
  const { data: city, error: cityError } = await supabase.from("tournament_cities").select("city").eq("id", row.tournament_city_id).single();
  if (cityError) throw new FixtureSaveError("Venue could not be loaded after saving.");
  return { id: row.id, tournamentCityId: row.tournament_city_id, name: row.name, address: row.address ?? undefined, city: city.city } satisfies ScheduleVenue;
}

export async function removeFixture(fixtureId: string, actor: string) {
  if (isDemoMode) {
    if (!await deleteDemoFixture(fixtureId, actor)) throw new FixtureSaveError("Fixture not found.");
    return;
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("delete_fixture", { p_fixture_id: fixtureId });
  if (error) throw new FixtureSaveError(error.code === "22023" ? error.message : "Fixture could not be deleted.");
  if (!data) throw new FixtureSaveError("Fixture not found.");
}

export async function removeVenue(venueId: string, actor: string) {
  if (isDemoMode) {
    const result = await deleteDemoVenue(venueId, actor);
    if (!result.deleted) throw new FixtureSaveError(result.error ?? "Venue could not be deleted.");
    return;
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("delete_venue", { p_venue_id: venueId });
  if (error) {
    const safeMessages: Record<string, string> = { "22023": error.message, "23503": error.message };
    throw new FixtureSaveError(safeMessages[error.code] ?? "Venue could not be deleted.");
  }
  if (!data) throw new FixtureSaveError("Venue not found.");
}

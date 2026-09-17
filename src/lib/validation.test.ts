import { describe, expect, it } from "vitest";
import { captainInvitationSchema, fixtureSchema, leadSchema, playerSchema, shortLeadSchema, venueSchema } from "@/lib/validation";

const valid = {
  captainName: "Meera Nair", displayName: "Meera", phone: "+91 98765 43210", whatsapp: "+91 98765 43210",
  email: "meera@company.example", company: "Northstar Systems", relationship: "Employee and captain",
  city: "Chennai", teamSize: "12–15 players", preferredMonth: "October 2026", companyApproval: "In progress",
  source: "Referral", campaign: "", futureInterests: [], message: "", operationalConsent: true,
  marketingConsent: false, website: "",
};

describe("leadSchema", () => {
  it("accepts a complete corporate team enquiry", () => {
    expect(leadSchema.safeParse(valid).success).toBe(true);
  });

  it("keeps operational and marketing consent independent", () => {
    const noOperations = leadSchema.safeParse({ ...valid, operationalConsent: false });
    expect(noOperations.success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, marketingConsent: false }).success).toBe(true);
  });

  it("rejects unknown cities and honeypot submissions", () => {
    expect(leadSchema.safeParse({ ...valid, city: "Goa" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, website: "https://spam.example" }).success).toBe(false);
  });
});

describe("shortLeadSchema", () => {
  const shortLead = {
    name: "Meera Nair",
    email: "meera@company.example",
    city: "Chennai",
    phone: "+919876543210",
    organization: "Northstar Systems",
    corporateConsent: true,
    website: "",
  };

  it("accepts the short corporate registration form", () => {
    expect(shortLeadSchema.safeParse(shortLead).success).toBe(true);
  });

  it("requires corporate confirmation and an international phone number", () => {
    expect(shortLeadSchema.safeParse({ ...shortLead, corporateConsent: false }).success).toBe(false);
    expect(shortLeadSchema.safeParse({ ...shortLead, phone: "9876543210" }).success).toBe(false);
  });
});

describe("captainInvitationSchema", () => {
  it("accepts a trimmed team name", () => {
    const result = captainInvitationSchema.safeParse({ teamName: "  Northstar XI  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.teamName).toBe("Northstar XI");
  });

  it("rejects empty and excessively long team names", () => {
    expect(captainInvitationSchema.safeParse({ teamName: " " }).success).toBe(false);
    expect(captainInvitationSchema.safeParse({ teamName: "x".repeat(121) }).success).toBe(false);
  });
});

describe("playerSchema", () => {
  const player = {
    name: "Meera Nair",
    email: "meera@company.example",
    phone: "+919876543210",
    employeeId: "NS-0142",
    epfoNumber: "100000000001",
  };

  it("accepts EPFO/UAN as an optional player detail", () => {
    expect(playerSchema.safeParse(player).success).toBe(true);
    expect(playerSchema.safeParse({ ...player, epfoNumber: "" }).success).toBe(true);
    expect(playerSchema.safeParse({ ...player, epfoNumber: "x".repeat(81) }).success).toBe(false);
  });
});

describe("fixtureSchema", () => {
  const fixture = {
    venueId: "venue-1",
    homeTeamId: "team-1",
    awayTeamId: "team-2",
    roundName: "City qualifier",
    matchNumber: 1,
    startsAt: "2026-11-21T03:30:00.000Z",
    endsAt: "2026-11-21T05:00:00.000Z",
    status: "draft",
    notes: "",
  };

  it("accepts a complete fixture", () => {
    expect(fixtureSchema.safeParse(fixture).success).toBe(true);
  });

  it("rejects the same team twice and invalid time ranges", () => {
    expect(fixtureSchema.safeParse({ ...fixture, awayTeamId: fixture.homeTeamId }).success).toBe(false);
    expect(fixtureSchema.safeParse({ ...fixture, endsAt: fixture.startsAt }).success).toBe(false);
  });
});

describe("venueSchema", () => {
  it("requires a city and a useful venue name", () => {
    expect(venueSchema.safeParse({ tournamentCityId: "city-1", name: "Central Cricket Ground", address: "MG Road" }).success).toBe(true);
    expect(venueSchema.safeParse({ tournamentCityId: "", name: "X", address: "" }).success).toBe(false);
  });
});

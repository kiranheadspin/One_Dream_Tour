import { describe, expect, it } from "vitest";
import { captainInvitationSchema, leadSchema, shortLeadSchema } from "@/lib/validation";

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

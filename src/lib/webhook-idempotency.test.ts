import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Razorpay webhook idempotency", () => {
  const route = readFileSync(path.join(process.cwd(), "src/app/api/webhooks/razorpay/route.ts"), "utf8");
  const migration = readFileSync(path.join(process.cwd(), "supabase/migrations/202608020001_one_dream_cup.sql"), "utf8");
  it("rejects unsigned payloads before processing", () => expect(route).toContain("verifyWebhook(rawBody,signature)"));
  it("checks the provider event id before insert", () => expect(route).toContain("eq(\"provider_event_id\",eventId).maybeSingle()"));
  it("enforces provider event uniqueness in PostgreSQL", () => expect(migration).toContain("provider_event_id text not null unique"));
});

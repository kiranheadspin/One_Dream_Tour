import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { hasAcceptedCurrentRules, RULES_SECTIONS, RULES_SOURCE, RULES_VERSION } from "@/lib/tournament-rules";
import { publicPages } from "@/lib/public-content";

describe("S50 rules source and acceptance", () => {
  it("serves the exact supplied brochure", () => {
    const pdf = readFileSync(`public${RULES_SOURCE.url}`);
    expect(createHash("sha256").update(pdf).digest("hex")).toBe(RULES_SOURCE.sha256);
  });
  it("uses the same rules for public display and captain review", () => {
    expect(publicPages.rules.sections).toBe(RULES_SECTIONS);
  });
  it.each([
    [{}, false],
    [{ rulesAcceptedAt: "2026-09-13T00:00:00Z" }, false],
    [{ rulesAcceptedAt: "2026-09-13T00:00:00Z", rulesVersion: "2026-draft" }, false],
    [{ rulesVersion: RULES_VERSION }, false],
    [{ rulesAcceptedAt: "2026-09-14T00:00:00Z", rulesVersion: RULES_VERSION }, true],
  ])("requires a timestamp and the current version: %j", (team, expected) => {
    expect(hasAcceptedCurrentRules(team)).toBe(expected);
  });
});

import { describe, expect, it } from "vitest";
import { getNewLeadIds } from "@/lib/lead-batch";

const lead = (id: string, createdAt: string, hasInteraction = false) => ({ id, createdAt, hasInteraction });

describe("getNewLeadIds", () => {
  it("keeps the three newest untouched enquiries in the New batch", () => {
    const ids = getNewLeadIds([
      lead("old", "2026-09-10T09:00:00.000Z"),
      lead("newest", "2026-09-13T09:00:00.000Z"),
      lead("second", "2026-09-12T09:00:00.000Z"),
      lead("third", "2026-09-11T09:00:00.000Z"),
    ]);

    expect(ids).toEqual(new Set(["newest", "second", "third"]));
  });

  it("removes a new enquiry from the batch after its first interaction", () => {
    const ids = getNewLeadIds([
      lead("newest", "2026-09-13T09:00:00.000Z", true),
      lead("second", "2026-09-12T09:00:00.000Z"),
      lead("third", "2026-09-11T09:00:00.000Z"),
      lead("old", "2026-09-10T09:00:00.000Z"),
    ]);

    expect(ids).toEqual(new Set(["second", "third"]));
  });
});

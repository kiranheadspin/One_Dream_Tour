import { describe, expect, it } from "vitest";
import { CITY_SCHEDULE, TOURNAMENT } from "@/lib/constants";

describe("published tournament details", () => {
  it("keeps the advertised cash total equal to its prize breakdown", () => {
    const calculatedTotal =
      TOURNAMENT.winnerPaise +
      TOURNAMENT.runnerUpPaise +
      TOURNAMENT.qualifierAwardPaise * TOURNAMENT.qualifierCount;

    expect(calculatedTotal).toBe(TOURNAMENT.prizePoolPaise);
    expect(calculatedTotal).toBe(28_000_000);
  });

  it("publishes all four city date ranges", () => {
    expect(Object.keys(CITY_SCHEDULE)).toEqual(TOURNAMENT.cities);
    expect(CITY_SCHEDULE.Bangalore.startDate).toBe("2026-11-21");
    expect(CITY_SCHEDULE.Chennai.endDate).toBe("2027-01-31");
  });
});

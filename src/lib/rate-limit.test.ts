import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests within a bucket and blocks excess calls", async () => {
    const key = `test-${crypto.randomUUID()}`;
    expect((await checkRateLimit(key, 2, 60_000)).allowed).toBe(true);
    expect((await checkRateLimit(key, 2, 60_000)).allowed).toBe(true);
    const blocked = await checkRateLimit(key, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("starts independent buckets for independent clients", async () => {
    expect((await checkRateLimit(`a-${crypto.randomUUID()}`, 1)).allowed).toBe(true);
    expect((await checkRateLimit(`b-${crypto.randomUUID()}`, 1)).allowed).toBe(true);
  });
});

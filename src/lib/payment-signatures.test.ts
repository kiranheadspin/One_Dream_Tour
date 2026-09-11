import { describe, expect, it } from "vitest";
import { hmacSha256, verifyHmacSha256 } from "@/lib/payment-signatures";

describe("payment signature verification", () => {
  it("accepts the provider HMAC for the exact order and payment", () => {
    const payload = "order_demo|pay_demo";
    const signature = hmacSha256(payload, "test-secret");
    expect(verifyHmacSha256(payload, signature, "test-secret")).toBe(true);
  });
  it("rejects tampered payment data and malformed signatures", () => {
    const signature = hmacSha256("order_demo|pay_demo", "test-secret");
    expect(verifyHmacSha256("order_demo|pay_changed", signature, "test-secret")).toBe(false);
    expect(verifyHmacSha256("order_demo|pay_demo", "short", "test-secret")).toBe(false);
  });
});

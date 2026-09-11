import { describe, expect, it } from "vitest";
import { buildUpiPaymentUri, formatPaymentStatus } from "@/lib/upi";

describe("buildUpiPaymentUri", () => {
  it("prefills the verified payee, amount, currency, and reconciliation reference", () => {
    const uri = buildUpiPaymentUri({
      upiId: "payments@example",
      payeeName: "One Dream Cup",
      amountPaise: 1_450_000,
      transactionReference: "ODC-DEMO-123",
      note: "Northstar Strikers registration",
    });
    const url = new URL(uri);

    expect(url.protocol).toBe("upi:");
    expect(url.hostname).toBe("pay");
    expect(url.searchParams.get("pa")).toBe("payments@example");
    expect(url.searchParams.get("pn")).toBe("One Dream Cup");
    expect(url.searchParams.get("am")).toBe("14500.00");
    expect(url.searchParams.get("cu")).toBe("INR");
    expect(url.searchParams.get("tr")).toBe("ODC-DEMO-123");
  });
});

describe("formatPaymentStatus", () => {
  it("uses operational labels for manual review states", () => {
    expect(formatPaymentStatus("submitted")).toBe("Awaiting confirmation");
    expect(formatPaymentStatus("paid")).toBe("Payment confirmed");
    expect(formatPaymentStatus("rejected")).toBe("Not received");
  });
});

export interface UpiPaymentInput {
  upiId: string;
  payeeName: string;
  amountPaise: number;
  transactionReference: string;
  note: string;
}

export function buildUpiPaymentUri(input: UpiPaymentInput) {
  const params = new URLSearchParams({
    pa: input.upiId,
    pn: input.payeeName,
    tr: input.transactionReference,
    tn: input.note,
    am: (input.amountPaise / 100).toFixed(2),
    cu: "INR",
  });

  return `upi://pay?${params.toString()}`;
}

export function formatPaymentStatus(status: string) {
  switch (status) {
    case "not_started":
      return "Not started";
    case "submitted":
      return "Awaiting confirmation";
    case "paid":
      return "Payment confirmed";
    case "failed":
      return "Payment failed";
    case "rejected":
      return "Not received";
    case "refunded":
    case "partially_refunded":
      return "Refunded";
    case "authorized":
      return "Authorized";
    default:
      return "Payment started";
  }
}

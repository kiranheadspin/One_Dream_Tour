export const TOURNAMENT = {
  name: "One Dream Cup",
  edition: "50th Special Edition",
  format: "Seven-over corporate tennis-ball cricket",
  season: "September–December 2026",
  feePaise: 1_450_000,
  prizePoolPaise: 25_000_000,
  winnerPaise: 15_000_000,
  runnerUpPaise: 5_000_000,
  losingSemiFinalistPaise: 1_000_000,
  losingQuarterFinalistPaise: 500_000,
  whatsapp: "9591011861",
  cities: ["Bangalore", "Chennai", "Hyderabad", "Pune"] as const,
} as const;

export const LEAD_STAGES = [
  "New",
  "Contacted",
  "Qualified",
  "Slot reserved",
  "Registration invited",
  "Payment pending",
  "Registered",
  "Participated",
  "Renewal opportunity",
  "Lost",
  "Archived",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export function formatInr(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export const whatsappUrl = (message: string) =>
  `https://wa.me/91${TOURNAMENT.whatsapp}?text=${encodeURIComponent(message)}`;
